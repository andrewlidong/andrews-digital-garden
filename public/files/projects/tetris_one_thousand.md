# Tetris One Thousand

## Massively multiplayer cooperative Tetris on one shared board

Tetris One Thousand is a cooperative multiplayer Tetris where every player shares a single board. It runs on a single Python process, streams state over WebSockets, and holds up under 100+ players at ~500 messages per second.

### Technologies Used
- Python
- FastAPI
- asyncio
- WebSockets
- Vanilla JS (single-file canvas client)

### Features
- **One shared board** — every connected player drops pieces onto the same grid, which grows dynamically from 20 to 500 columns as players join.
- **Lock-free concurrency** — the authoritative game engine is entirely synchronous, so asyncio's cooperative scheduling makes every mutation an atomic critical section without a single lock.
- **Delta wire protocol** — a dirty-cell set means a locked piece costs ~40 bytes on the wire instead of a ~40KB full-grid broadcast.
- **Real Tetris feel** — guideline SRS wall kicks (including the I-piece's own kick table), per-player 7-bag randomization, hold, ghost pieces, and client-side DAS input handling.
- **No game over** — topping out is a phase change, not a terminal state: the board wipes, a round counter bumps, and play continues with scores intact.
- **Resilient client** — one HTML file with no build step: auto-scrolling viewport camera, 2-second auto-reconnect, and a full snapshot on every join so resume logic isn't needed.

### How It Works
The server is authoritative for everything: clients send intents like `{"action": "hard_drop"}` and render whatever state comes back. A background asyncio task ticks gravity while each WebSocket connection applies player actions to a shared `GameEngine`; after any mutation the server broadcasts only the cells that changed. Movement validates against locked cells only — active pieces pass through each other like ghosts, which keeps a crowded board fair. Tested in three layers: unit tests on the pure engine, in-process WebSocket integration tests via FastAPI's `TestClient`, and a load-test harness of N asyncio clients firing random actions.

Read the full write-up: [Building Massively Multiplayer Tetris](https://andrewlidong.xyz/read/blog/building-massively-multiplayer-tetris).

### Live Demo
Play it at [tetris-one-thousand.onrender.com](https://tetris-one-thousand.onrender.com/).

### GitHub Repository
For more details and to view the source code, visit the [GitHub repository](https://github.com/andrewlidong/tetris-one-thousand).
