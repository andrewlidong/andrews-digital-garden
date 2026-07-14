---
title: "Building Massively Multiplayer Tetris"
date: "2026-07-13"
subtitle: "I recently build a cooperative multiplayer Tetris where every player shares a single board."
slug: "building-massively-multiplayer-tetris"
---

I recently build a cooperative multiplayer Tetris where every player shares a single board. It runs on a single Python process, streams state over WebSockets, and holds up under 100+ players at ~500 messages per second.

This post is a technical walkthrough of how it works: the concurrency model, the wire protocol, the delta-broadcast scheme, and a few design decisions I made.

Play it at [https://tetris-one-thousand.onrender.com](https://tetris-one-thousand.onrender.com/)/ and see the code at [https://github.com/andrewlidong/tetris-one-thousand.](https://github.com/andrewlidong/tetris-one-thousand)

![](/blog-images/building-massively-multiplayer-tetris-1.png)

## Architecture

The server is authoritative for everything. Cleints never compute game logic; they send intents `{“action”: “hard_drop”}` and render whatever state the server broadcasts. A single `GameEngine` instance owns the grid and every player’s falling piece. A backgroud asyncio task ticks gravity twice a second. Each WebSocket connection is its own asyncio task that applies player actions to the engine when they arrive. After any mutation - a tick or a player action - the server broadcasts a delta (only what changed) to every connection.

![](/blog-images/building-massively-multiplayer-tetris-2.png)

## Concurrency without locks

A common question with this design is how to handle locks with a thousand connections mutating one shared grid.

There aren’t any ~ and it’s a core reason why Python’s asyncio is a great fit for this. Asyncio is *cooperative* single-threaded multitasking. A task only yields control at an `await`. The engine’s mutation paths - `process_action()`, `tick()`, `_lock_piece()` - are entirely synchronous functions: between the moment a WebSocket handler calls `engine.process_action(…)` and the moment it returns, no other task can run. Every mutation is automatically a critical section.

```
data = await ws.receive_json() # <- task can be suspented here
action = Action(data["action"])
engine.process_action(player_id, action) # <- atomic: no await inside
delta = engine.get_delta() # <- still atomic
await manager.broadcast({"type": "delta", **delta}) # <- suspension OK now
```

The discipline this buys you is worth stating explicitly: **never await between reading game state and writing it**. As long as that invariant holds, two players hard-dropping into the same cell at the ‘same time’ is impossible - one of them is always processed first, and the second one’s peice simply finds the cell occupied.

I came into this project wanting to use Python for several personal reasons, but a common complaint is that its slow and single-threaded. I think that misses what this workload actually is. A Tetris action is a few dozen integer comparisons ~ the server spends most of its time waiting on sockets, which is exactly the case the asyncio event loop (and uvicorn’s C-accelerated loop under it) is optimized for.

## Dynamically Growing Board

A fixed-size board fails at both ends: 20 columns is pretty chaotic with 50 players and 500 columns feels like a desert with 3. So the board is dynamic - it starts at 20 columns and gains 2 columns per player, capped at 500.

```
def desired_width(self, num_players) int) -> int:
  return max(BOARD_MIN_WIDTH, min(num_players * COLUMNS_PER_PLAYER, BOARD_MAX_WIDTH))
```

Expansion appends empty cells to the right of every row - O(height \* new columns), no reallocation drama because rows are plain Python lists. The board never shrinks: contracting would have to answer the question of what happens to locked cells in amputated columns, and I couldn’t come up with an answer that felt fair to whoever stacked there.

The interesting part is telling connected clients about it. The delta message grows a `board_width` field only on the tick where expansion happened, and the client pads its local grid.

```
if (msg.board_width && msg.board_width > boardWidth) {
  const extra = msg.board_width - boardWidth;
  for (let r = 0; r < grid.length; r++)
    for (let i = 0; i < extra; i++)
grid[r].push(0);
}
```

## Engine Internals

Each player owns a `PieceState` - piece type, anchor position, rotation index - in a `dict[str, PieceState]`. Piece geometry is data, not code: every tetronimo is a table of four rotation states, each state being four `(row, col)` offsets from the anchor. Rotation is `(rotation + 1) % 4` plus a table lookup.

Movement is validated against **locked cells only** - active pieces pass through each other like ghosts. I went back and forth on this (an earlier prototype made active pieces solid, with a cell → players index for O(1) collision checks), but phantom-mode won for the shared board. With dozens of pieces falling in a 100-column region, solid pieces produce constant unfair mid-air landings on a piece that moves away 200ms later.

Rotation uses SRS wall kicks - the guideline-standard table of fallback offsets to try when a rotation collides. The I-piece gets its own kick table (its bounding box is 4x4 rather than 3x3, so its kicks are different - this is the detail most homemade Tetris implementations skip, and its why their I-piece feels wrong near walls):

```python
kicks = get_wall_kicks(piece.piece_type, piece.rotation, new_piece.rotation)
for d_row, d_col in kicks:
  kicked = new_piece.moved(d_row, d_col)
  if self.board.is_valid_position(kicked):
    self.active_pieces[player_id] = kicked
    return True
```

Randomization is per-player 7-bag: each player has their own shuffled bag of all seven pieces, dealt out before reshuffling. Sharing one global bag across 1000 players would technically be “fair” but it makes your piece sequence depend on how fast strangers are dropping - per-piece bags keep each player’s drought protection intact.

Line clears are a single bottom-up compaction pass - O(HxW), no per-line splicing:

```python
write_row = self.height - 1
for read_row in range(self.height - 1, -1, -1):
  if all(cell != EMPTY for cell in self.grid[read_row]):
    cleared += 1
  else:
    if write_row != read_row:
      self.grid[write_row] = self.grid[read_row]
     write_row -= 1 
```

A 500-column line clear is gloriously rare and requires genuine accidental cooperation from dozens of people. When it happens, the player who locked the completing piece gets the score credit (100/300/500/800 for 1-4 lines) an intentionally blunt rule. Tracking “fair” proportional credit for who contributed to a row means per-cell ownership metadata and a payout formula nobody can really feel in the gameplay. The blunt rule creates a fun meta instead: sniping almost-complete rows is a legitimate thing (albeit lame) thing to do.

## The Wire Protocol

The naive protocol - broadcast the full grid every tick - dies immediately at this scale. The grid is 40 x 500 = 20,000 cells; JSON-encoded that’s ~40KB and at 2 ticks/second x 1000 clients you’re pushing 80MB/s of redundant board state before anyone even moves.

The fix is a dirty-set delta scheme. The engine tracks every cell that changed since the last broadcst:

```python
self._dirty_cells: set[tuple[int, int]] = set()
# on lock:
for cell in get_cells(piece):
  self._dirty_cells.add((cell.row, cell.col))
```

get\_delta() drains the set into \[row, col, color\] triples. A locked piece is 4 cells (approximately 40 bytes) instead of 40KB - three orders of magnitude less. Line clears conservatively mark the whole board dirty (every cell above the cleared line moved), which is a lazy tradeoff that I think is correct (clears are very rare, and shipping one full-board delta occasionally beats maintaining precise shift tracking.

Full snapshots exist too, but only once per connection at join:

```
server → client:  {"type": "welcome", "player_id": ...}     once
                  {"type": "state", grid, active_pieces...}  once (full snapshot)
                  {"type": "delta", grid_delta?, active_pieces, leaderboard, round...}  forever after
client → server:  {"action": "left" | "right" | "soft_drop" | "hard_drop"
                            | "rotate_cw" | "rotate_ccw" | "hold"}
                  {"name": "Andrew"}
```

Active pieces are the one thing sent in full every delta - with a thousand players that’s the real payload and its inherently non-delta-able (every piece moves every tick by definition). Each entry carries the piece cells, ghost-piece cells (the server computes where your piece would land, so the client renders the landing preview without knowing any game rules), next/held piece, name and score.

## Rounds: designing out “game over”

My first version had a bug disguised as a feature: a global `game_over` flag. When the stack reached the top, the flag flipped and the game ended - for *everyone, permanently*, because nothing ever reset it. In single-player that’s just Tetris. In a persistent 1000-player world it means that one person building a tower would end the game for a thousand people until someone restarts the process. Also, it’s just no fun.

The fix reframes top-out as a phase change instead of a terminal state:

```python
def _reset_round(self) -> None:
    """Wipe the board and start a new round. Players and scores carry over."""
    for r in range(self.board.height):
        for c in range(self.board.width):
            self.board.grid[r][c] = CellColor.EMPTY
            self._dirty_cells.add((r, c))
    self.round += 1
    self._round_just_reset = True
```

Top-out wipes the grid, bumps a round counter, and play continues - pieces mid-fall stay mid-fall, scores survive, nobody reconnects. The `_round_just_reset` flag is consumed by exactly one delta so every client can flash “BOARD FULL - ROUND N” once. Spawning got the same never-give-up treatment: instead of failing when a random spawn column is blocked, the server scans every column (starting from a random offset, wrapping around) and only wipes the board if literally nowhere fits.

The design lesson generalizes that **in a massively-shared world, any global terminal state is a denial-of-service primitive**. Every failure has to resolve into continuation.

## The Client

The client is one HTML file with no framework or build step. A few pieces earn their place:

**DAS (Dealyed Auto Shift)**. Native browser key repeat is OS-configurable and typically ~500ms delay which is unplayably sluggish for Tetris. The client ignores event.repeat entirely and runs its own timers: fire once on keydown, wait 170ms, then repeat every 50ms until keyup. A `blur` handler kills all timers so switching tabs mid-keypress doesn’t leave your piece drifting left forever.

**Viewpoint scroll.** A 500-column board at 16px/cell is an 8000px-wide canvas. The client auto-scrolls horizontally toward your piece, but only when it drifts more than 30% off-center and only 15% of the remaining distance per frame - dead zone plus easing, so the camera never fights your left/right inputs.

**Reconnect.** `ws.onclose` schedules a reconnect in 2 seconds, and since the server sends a full snapshot on every new connection, a reconnecting client needs zero resume logic - it just re-joins as a fresh player.

![](/blog-images/building-massively-multiplayer-tetris-3.png)

## Testing

This was tested in three layers

1.  **Unit tests on the pure engine** - no sockets involved because the engine is just synchronous functions on plain data. Bag distribution, wall kicks, lock/clear/score, hold-once-per-piece, round resets. This is fast enough to run on every save.
    
2.  **Websocket integration tests** via fastAPI’s `TestClient` which runs the real ASGI app in-process runs the full protocol (welcome → snapshot → deltas) without a network.
    
3.  **Load test harness** that spawns N asyncio clients sending random actions at 5 actions per second each. 100 current players sustain ~500 messages per second with no errors on the free-tier render deploy.
    

## Limitations

The load test is what catches the full-grid broadcast problem.

The deployed free tier realistically handles ~100 concurrent players, not 1000. The current known bottleneck is the broadcast loop: it awaits each client’s send sequentially, so one slow consumer delays everyone behind it. The path to 1000 concurrent players would be the following:

-   **Fan-out concurrently** - asyncio.gather sends in chunks of 50, so a slow client stalls only its chunk
    
-   **Serialize once, not N times** \- encode each delta to bytes a single time and reuse it for every connection (with `orjson` would be ~5-10x faster than stdlib `json`).
    
-   **Drop or coalesce for slow clients** \- deltas supersede each other for the board, so a backed-up client can safely skip to the newest.
    
-   `uvloop` - a drop-in event loop replacement worth ~2x on socket-heavy workloads
    
-   **Binary encoding** - the `[row, col, color]` triples pack naturally into typed arrays; JSON was a compatibility choice, not necessarily the most efficient.
    

Luckily none of these requires changing the architecture which is the takeaway I’d offer anyone else looking to build a real-time multiplayer prototype: a single Python process with cooperative concurrency, an authoritative synchronous core, and a delta protoco get you *shockingly* far before you need anything fancier.

* * *

*The full source - engine, server, client, tests and the single-game pygame version that started this repo are available at [https://github.com/andrewlidong/tetris-one-thousand](https://github.com/andrewlidong/tetris-one-thousand) . Happy tetrising!*
