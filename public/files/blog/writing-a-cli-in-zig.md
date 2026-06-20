---
title: "writing a cli in zig"
date: "2026-05-26"
subtitle: "baby's first babyline"
slug: "writing-a-cli-in-zig"
---

this last week i decided to sit down and write a small zig cli called [babyline](https://github.com/andrewlidong/babyline). i started by basically following this [tutorial](https://rebuild-x.github.io/docs/#/./zig/terminal/cli) which walks you through building a small subcommand-style cli in zig.

i later extended beyond the tutorial by adding things like:

1.  a persistent config store with real on-disk format, atomic writes and section-aware keys
    
2.  a self-documenting system that generates a markdown reference, a man page, and a plain text help file from a single in-memory table of commands
    
3.  shell completion generation for bash, zsh and fish, from the same table actually
    
4.  an interactive arrow-key driven menu using raw mode and ANSI escape codes
    
5.  tests (yay)
    

running cloc on it shows ~2200 lines of zig across just 8 files, making it small enough that i can hold the whole program in my head, which was kind of the point. i first decided to start writing zig after having a conversation with my friend andrew about [awebo](https://codeberg.org/awebo-chat/awebo), a small self-hostable chat app written in zig which i’d love to follow and possibly contribute to someday. besides awebo though, we also talked about zig and what the language is really trying to accomplish and the answer really resonated with me ~ get people to write better software.

the next day i cloned it, got it building locally and then realized i had no servers to join (if you have one plz invite me). i also watched a youtube clip about zig where he points out that airplanes are these wild aluminum tubes that hurl people through the upper atmosphere at hundreds of miles an hour, but are basically the safest mode of transport ever invented, while we barely trust software to track git properly now. jonathan blow gives a talk in the same neighborhood, [Preventing the Collapse of Civilization](https://www.youtube.com/watch?v=pW-SOdj4Kkk) where he argues the software stack is getting so tall and abstracted that we’re forgetting how much of it works ~ and as someone who uses a lot of ai assisted coding this is definitely something i resonate with. all to say, when andrew told me his goal with zig is to get people to write better software i decided that i want to be one of those people.

# the command table

so anyways, back to babyline. starting off, i just want to point out a bit of code in my main file:

```
const commands = [_]cli.command{
    cli.command{
        .name = "hello",
        .func = &cmd.methods.commands.helloFn,
        .req = &.{"greeting"},
        .opt = &.{"name"},
        .desc = "Greet someone",
    },
    // ...
};

const options = [_]cli.option{
    cli.option{
        .name = "name",
        .short = 'n',
        .long = "name",
        .func = &cmd.methods.options.nameFn,
        .desc = "Name to greet",
    },
    // ...
};
```

this is the entire schema of my program . what’s interesting is that this same table drives four different things ~ the argument parser at runtime, the markdown reference embedded in the README, the man page, and the bash, zsh, and fish completion scripts.

if you’ve gone ahead and taken a look at the repo you’ll see that the README has a generated section bracketed by `<! — BEGIN GENERATED —>`. when i add a command, i add one struct literal to `main.zig` and run `zig build docs` and the README, the man page, the text help, and the completion scripts all update from the same source.

if you’ve written CLIs in other languages you know the alternative. in Go , for example, you write your `flag.StringVar` calls in `main`, then you separately keep a `README.md` in sync by hand, and if you want bash completion you either generate it by hand or you reach for `cobra` which is a gigantic dependency. in Python, `argparse` will print decent help text but the man page does not exist, and if you want shell completions you have to reach for `argcomplete` or `click`. in Rust, `clap` does all of this, but the way it does is via a derive macro that generates code you cannot read, on top of a builder API that you also cannot easily read. the contract between your code and its documentation is wherever the macro author decides to put it. in babyline that contract is the array literal in `main.zig`. that’s it. the price of this design is that the array literal is a little ugly and repetitive, but the plus is that nothing is ever out of sync because there is nothing to sync.

# the parser

`startWithArgs in cli.zig` is about 80 lines, and this is pretty much all of it:

```
pub fn startWithArgs(commands: []const command, options: []const option, args: anytype, debug: bool) !void {
    // 1. Bounds checks.
    // 2. Find the command whose name matches args[1].
    // 3. Walk args[2..], pulling flags and their following values.
    // 4. Check that every required option for the command was provided.
    // 5. Call the command's handler, then call each option's handler.
```

the flag-value association is super simple: if the next argument doesn’t start with -, treat it as the value of the current flag, and if it does, the current flag gets an empty string. there is no `—-flag=value` syntax, no clustering of short flags like `-abc` and no positional arguments. baby is crude.

one thing that took me a moment to internalize is that the function signature is `args: anytype` which means it’ll accept any array-like that the compiler can figure out how to iterate. this is zig’s generics ~ there are no type parameters, no <T>, no trait bounds. the compiler monomorphizes `startWithArgs` once per call site and checks that the operations you perform on `args` are valid for the concrete type that’s passed in. if you pass in something that doesn’t support `.len`, you get a compile error at the line that says `args.len`. this feels slightly unnerving as someone whose first systems programming language was Rust, and coming from Go where the generics machinery is heavier and the inference is weaker this was kind of shocking to me.

# the config store

super proud of this one! the on-disk format is a tiny INI dialect:

```toml
# auto-managed by babyline
[editor]
theme = "dark"
font = "Berkeley Mono"

[general]
username = "andrew"
```

the data model is two levels deep: sections, then keys. keys can be referenced as `editor.theme` (section-qualified) or just `theme` (bare keys live in a `general` section). the `splitKey` function validates that each side is a valid identifier and rejects anything weird

```
pub fn splitKey(key: []const u8) Error!KeyParts {
    if (key.len == 0) return Error.InvalidKey;
    // count dots, find the split point, validate both halves as identifiers
}
```

what i love is the `Config` struct itself:

```
pub const Config = struct {
    allocator: std.mem.Allocator,
    sections: std.StringHashMap(Section),
    // ...
};
```

the allocator is a field. not a global, not a singleton, not something the standard library hides behind a `GlobalAlloc` trait you never look at. its a regular struct field, and every function that needs to allocate takes it explicitly. `Config.init(allocator)` returns a `Config`. `Config.deinit` walks the hash map and frees every key and value it ever owned. if you forget to call `deinit`, the test allocator tells you about it.

the `set` method is worth talking about too here:

```
pub fn set(self: *Config, key: []const u8, value: []const u8) !void {
    const parts = try splitKey(key);

    const value_dup = try self.allocator.dupe(u8, value);
    errdefer self.allocator.free(value_dup);

    var section_res = try self.sections.getOrPut(parts.section);
    if (!section_res.found_existing) {
        const section_dup = self.allocator.dupe(u8, parts.section) catch |err| {
            _ = self.sections.remove(parts.section);
            return err;
        };
        section_res.key_ptr.* = section_dup;
        section_res.value_ptr.* = Section.init(self.allocator);
    }

    const kv_res = try section_res.value_ptr.getOrPut(parts.name);
    if (kv_res.found_existing) {
        self.allocator.free(kv_res.value_ptr.*);
        kv_res.value_ptr.* = value_dup;
    } else {
        const name_dup = self.allocator.dupe(u8, parts.name) catch |err| {
            _ = section_res.value_ptr.remove(parts.name);
            return err;
        };
        kv_res.key_ptr.* = name_dup;
        kv_res.value_ptr.* = value_dup;
    }
}
```

there are three allocations: the duplicated value, the duplicated section name (if the section is new) and the duplicated key name (if the key is new). each of those allocations can fail. `errdefer` says “if this function returns an error, run this cleanup.” `catch |err| { …; return err; }` says if this allocation fails undo the partial insert we just did into the hash map and propogate the error.

the whole function is, in a sense, a tiny transaction. either the key ends up in the map with all of its memory correctly owned, or nothing changes and no memory leaks. THERE IS NO GARBAGE COLLECTOR TO SAVE YOU. there is no `try` operator that papers over the cleanup. cleanup after yourself!

coming from python this is a lot of bookkeeping. relative to Go it feels like extra work for problems the runtime would handle. it feels somewhat familiar to Rust, except Rust hides allocator failures behind a global panic so you basically never write the failure path. in zig you write the failure path, and once you have written a few of these you start to feel like you’re starting to grasp the shape of the program.

the `save` method writes to a `.tmp` path first and then atomically renames it:

```
const tmp_path = try std.fmt.allocPrint(self.allocator, "{s}.tmp", .{path});
defer self.allocator.free(tmp_path);

{
    const tmp_file = try std.Io.Dir.createFileAbsolute(io, tmp_path, .{ .truncate = true });
    defer tmp_file.close(io);
    try tmp_file.writeStreamingAll(io, buf.items);
}

try std.Io.Dir.renameAbsolute(tmp_path, path, io);
```

if the program crashes mid-write, the real config file is untouched. this is the kind of detail that the rebuild-x tutorial doesn’t cover and you probably wouldn’t bother with for a toy project, but i figured since it was just a few lines i would include it.

# self documenting from one source of truth

`docs.zig` consumes the same command and option tables and writes them out in three formats: Markdown, troff (for man pages), and plain text. there is also a fourht mode, `all`, which does all three plus rewrites the generated block inside README.md.

the format enum looks like this:

```
const Format = enum {
    markdown,
    man,
    text,

    fn fileName(self: Format) []const u8 {
        return switch (self) {
            .markdown => "babyline.md",
            .man => "babyline.1",
            .text => "babyline.txt",
        };
    }
};
```

methods on enums live next to variants and dispatch off them. there is nothing magical happening but it just feels good.

the man page writer emits troff directly:

```
try w.writeAll(
    \\.TH BABYLINE 1 "" "" "babyline manual"
    \\.SH NAME
    \\babyline \- a small Zig CLI demo
    \\.SH SYNOPSIS
    \\.B babyline
    \\.I command
    \\.RI [ options ]
    \\
);
```

those \\ lines are zig’s multi-line string literal syntax that are exactly what they look like. the leading \\ is the marker and everything after it is verbatim, with no escaping required. compared to Go’s backtick strings or Python’s triple-quoted strings, the zig version is a little less aesthetically pleasing in source but a lot easier to compose with other code since each line is its own token and you can indent the whole block freely.

the README rewriter is kind of surprisng:

```
const begin_idx = std.mem.indexOf(u8, existing, readme_begin) orelse { ... };
const end_idx = std.mem.indexOf(u8, existing, readme_end) orelse { ... };
const prefix = existing[0 .. begin_idx + readme_begin.len];
const suffix = existing[end_idx..];
```

it reads the existing README, finds the markers, takes the bytes before the start marker and the bytes after the end marker, writes a new file with the regenerated reference sandwiched between them. the README in this repo realls is git diff-able because the human-written stuff and the machine-written reference are clearly separated.

i hadn’t thought before about how rarely projects do this (i’m sure there’s probably good reasons not to). most CLIs either have hand-maintained docs that are always slightly wrong or they auto-generate the whole thing and the doc feels like compiler output. this middle path only took about forty lines of code to implement and i’m quite happy with it.

# shell completion for THREE SHELLS!

this part was kind of hard.

bash, zsh and fish all support tab completion but all are a little different. each has its own DSL and conventions about how subcommands work, and their own way of registering themselves with the shell.

## bash

bash completion works by setting `COMPREPLY` to the list of valid completions for the current word. you read `COMP_WORDS[COMP_CWORD]` to figure out what the user has typed so far, then `compgen -W “list of options -- $cur”` to filter. the babyline generator emits a `case` statement on the current subcommand:

```bash
case "$cmd" in
    hello)
        opts="-g --greeting -n --name"
        ;;
    user:create)
        opts="-u --username"
        ;;
    *)
        opts=""
        ;;
esac
COMPREPLY=( $(compgen -W "$opts" -- "$cur") )
```

one subtlety is that bash treats : as a word break by default, which means user:create gets parsed as two separate words. the completion script fixes this with `COMP_WORDBREAKS="“${COMP_WORDBREAKS//:/}'“`. i didnt actually know this existed until i tried typing `user:` and watched the completion fall apar ):

## zsh

zsh has a way more sophisticated completion system. the standard pattern is:

```bash
#compdef babyline
_babyline() {
    local -a commands
    commands=(
        'hello:Greet someone'
        'user\:list:List users'
    )
    if (( CURRENT == 2 )); then
        _describe 'command' commands
        return
    fi
    case "$words[2]" in
        hello)
            _arguments \
                '(-g --greeting)'{-g,--greeting}'[Greeting word]:greeting:' \
                '(-n --name)'{-n,--name}'[Name to greet]:name:'
            ;;
    esac
}
_babyline "$@"
```

the zsh quirk is also colons. in zsh, the `_describe` builtin uses : to separate the completion candidate from its description, so a subcommand named `user:list` has to be written as `user\:list`. the generator does this byte by byte:

```
for (c.name) |ch| {
    if (ch == ':') try w.writeAll("\\");
    try w.print("{c}", .{ch});
}
```

the \_arguments syntax is its own weird sub-language. `'(-g --greeting)'{-g,--greeting}'[Greeting word]:greeting:'` says: “this argument is `-g` or `--greeting`, they are mutually exclusive (the parenthesized prefix), the description is `Greeting word`, the value placeholder is `greeting`.” this took me awhile to figure out.

## fish

fish completion was actually the simplest. each completion is a `complete` call with conditions:

```
complete -c babyline -n '__fish_use_subcommand' -a 'hello' -d 'Greet someone'
complete -c babyline -n '__fish_seen_subcommand_from hello' -s g -l greeting -d 'Greeting word' -r
```

\_\_fish\_use\_subcommand is true when no subcommand has been picked yet. \_\_fish\_seen\_subcommand\_from hello is true once you have typed hello. -s g is the short flag, -l greeting is the long flag, -d is the description, -r means “requires an argument.” fish reads exactly like english, and of the three probably the only completion DSL i would willingly write by hand.

one thing i didn’t expect going in was that writing the completion generator would make writing the man page generator almost free. they are the same data, projected into different syntaxes. once i had walked the command table to emit complete -c babyline -n \_\_fish\_seen\_subcommand\_from hello -s g -l greeting, i had basically figured out how to walk it to emit. .TP\\n.B hello\\nRequired: \\-g, \\-\\-greeting. the transforms are different but the traversal is not. about two thirds of `docs.zig` was a port of a structural idea i had already worked out in `completion.zig`.

the completion problem is genuinely hard ~ three shells, three syntaxes, three sets of conventions. buy once you do the hard part once, every adjacent problem (man pages, markdown, plain text help) becomes a pretty quick job.

# the interactive menu

`src/interactive.zig` implements an arrow-key driven menu which is the sort of thing you see in `npm init` or `gh repo create`. the mechanism is older than any of those tools:

1.  put the terminal in raw mode (no line buffering, no echo, no signal interpretation).
    
2.  read a byte at a time from stdin.
    
3.  if you see 0x1b (the escape character), peek at the next two bytes to see if it is an arrow key escape sequence (\\x1b\[A is up, \\x1b\]B is down, etc.
    
4.  use ANSI escapes to redraw the menu in place (\\x1b\[2k clears a line, \\x1b{n}A moves the cursor up n lines).
    

the raw mode setup looks like this:

```
var raw = original;
raw.lflag.ECHO = false;
raw.lflag.ICANON = false;
raw.lflag.ISIG = false;
raw.iflag.IXON = false;
// ...
try std.posix.tcsetattr(fd, .NOW, raw);
```

std.posix.termios is a thin wrapper over the POSIX struct, and the flag fields are typed enums rather than the bitmask soup you would write in C. the exit path uses defer raw.exit() so the terminal goes back to sane settings even if the program panics. there is something really satisfying about a deferred restore of terminal state. forgetting to put the terminal back into cooked mode is a classic bug, and Zig’s defer makes it nearly impossible.

the arrow key parser was surprisingly simple in zig:

```javascript
0x1b => {
    const b2 = readByteTimeout() orelse return .escape;
    if (b2 != '[') return .escape;
    const b3 = readByteTimeout() orelse return .escape;
    return switch (b3) {
        'A' => .up,
        'B' => .down,
        'C' => .right,
        'D' => .left,
        else => .escape,
    };
},
```

Key is a tagged union (union(enum)), which is zig’s sum type. the pattern of read a byte, branch on it, sometimes peek ahead, return a discriminated value, is exactly what an enum union is for, and the code reads like the protocol its implementing.

# 0.15 to 0.16

i started this project on zig 0.15, but about midway through as i was adding the docs generator and the test suite i switched to zig 0.16.

i want to exercise some nuance here because “everything broke” is the kind of thing people say about zig that scares newcomers off, and the reality is more interesting than that.

the three things that broke, in order of how much they cost me were:

### std.io became `std.Io`

the standard library’s I/O got a major redesign. the capital-I Io interface is not an explicit argument that almost every file operation takes. before you would write something like this:

```
const file = try std.fs.cwd().createFile(path, .{});
try file.writeAll(buf);
```

after, the same code looks like:

```
const io = runtime.io;
const cwd = std.Io.Dir.cwd();
const file = try cwd.createFile(io, path, .{});
try file.writeStreamingAll(io, buf);
```

io is a std.Io value that you thread through every operation that touches the outside world. it is basically a userspace replacement for the implicit “OS is always there” assumption that most languages make. now you can mock it in tests, replace the underlying implementation and plug in async runtimes without rewriting your call sites.

this was the biggest change to deal with because almost every file operation i’d written needed an extra argument. i added `runtime.zig`

```
pub var io: std.Io = undefined;
pub var gpa: std.mem.Allocator = undefined;
pub var arena: *std.heap.ArenaAllocator = undefined;
pub var environ: std.process.Environ = undefined;

pub fn init(values: std.process.Init) void {
    io = values.io;
    gpa = values.gpa;
    arena = values.arena;
    environ = values.minimal.environ;
}
```

i am of course cheating a little by stashing these in globals. i think the right thing to do is to pass them in as arguments. for a cli this size the globals are fine. for a library you would want to thread them through explicitly.

### writers and readers got an interface refactor

previously you would write to a file with file.writer() and get back a thing you could call .print() on. after 0.16 the writer is bifurcated, meaning that there’s a backing writer (the thing that writes to the file) and an interface (the thing you call `.print` on, which buffers.

the pattern looks like this:

```
var buf: [8192]u8 = undefined;
var fw = file.writer(io, &buf);
const w = &fw.interface;

try w.writeAll("hello\n");
try w.print("count: {d}\n", .{42});
try w.flush();
```

you provide the buffer and call .flush() at the end. if you forget the flush, your output gets silently truncated (which can be frustrating to debug the first time it happens ):

this makes the buffer and the flush visible and prevents any hidden states ~ so i’d say its well worth the boilerplate. if you want a different buffer size you just change one number and if you want no buffering just pass a zero-length buffer.

for the in-memory case there is std.Io.Writer.Allocating which i use in my tests:

```
var aw: std.Io.Writer.Allocating = .init(testing.allocator);
defer aw.deinit();

try writeBash(&aw.writer, &test_commands, &test_options);
const out = aw.written();
```

which is the same writer interface but appends to a growable buffer that you can inspect after the fact. this makes testing the doc and completion generators dramatically easier than it would be with a real file.

### rip std.process.argsAlloc

before you got command-line arguments with std.process.argsAlloc(allocator) which would heap-allocate a slice of strings. after, the entry point of your program signature changes:

```
pub fn main(init: std.process.Init) !void {
    runtime.init(init);
    const args = try init.minimal.args.toSlice(init.arena.allocator());
    // ...
}
```

`std.process.Init` is the new “everything you need at startup” handle. it carries the allocator, the I/O interface, the environment, and the arguments. you call `toSlice` on the arg list to get a normal slice of strings. the arena allocator inside `init.arena` is meant to be used for things you do not need to free, like the args themselves.

once i understood the new shape the migration was not that bad. it was mostly just updating call sites tbh, and the fact that the compiler errors point you at the exact line with the exact type mismatch and often with a ‘did you mean’ suggestion makes it a pretty painless migration.

the thing i’d like to emphasize though is that the migration was not gratuitous. even as a newbie to the language i felt that each of the changes made the language better in a specific way. std.Io is the foundation of the eventual async/concurrency story that zig seems to be telling. the writer split makes buffering and flushing visible. the Init struct unifies all of the things every program needs at startup so they can be passed around cleanly.

the elephant in the room is that zig is still pre-1.0. things will keep breaking. you will have to pin your versions. but i think that’s okay! it really feels like a passion project for the members involved and it feels to me like the language will continue to get better and the gap between what the compiler does today and what the zig team wants it to do will continue to shrink.

# what does zig make me think about differently

i’ve mostly written go, typescript and python at work, and at recurse center i worked a fair amount in rust. zig has made me notice three things that none of the languages really force me to confront.

1.  allocators are arguments, not ambient
    

in go and python the allocator is the garbage collector and you kind of don’t really think about it. in rust, the allocator exists but the global allocator is invisible and String::new and Vec::new just work. in zig, every function that can allocate takes the allocator as an argument. this sounds annoying but in practice it is clarifying. you look at a function signature and can immediately tell whether it might allocate. the test allocator can verify that every alocation is matched by a free. the arena allocator lets you batch-free a whole bunch of stuff at once, which is great for parser-style code where you allocate a million little things and then throw all of them awawy. the choice of allocator is a design decision, and zig makes you make it.

2.  errors are values from a closed set.
    

zig errors are an enum. each function declares which errors it can return with !T (where the error set is infered) or MyError!T (where you name the set explicitly). the compiler will not let you catch an error that the function does not actually return. you cannot subclass an error. you cannot attach a stack trace or a backtrace to it. the error is a tag, the union of tags is infinite, and you handle each one or you bubble it up.

this is restrictive in the way that good type systems are restrictive. you spend a little more time upfront but a lot less time chasing runtime exceptions.

3.  hidden control flow
    

in Go, calling ‘foo()’ might run a finalizer somewhere. in Python, foo() might trigger a **del**. In Rust, let x = foo(); might run a Drop impl when x goes out of scope. in zig, foo() runs foo. that’s it. no destructors, no implicit conversions, no operator overloading, no exceptions. if you want cleanup you write defer. if you want it conditional on an error you write errdefer. if you want resources released you call the deinit function yourself.

this sounds primitive and in some ways it is. the first time you forget a deinit you are going to wish for RAII (resource allocation is initialization). but the discipline pays off. when i read zig code i know what it does, because everything it does is in front of my face. compare this to a non-trivial rust function where five different traits might be silently coercing types and running drop glue and unwinding through generic monomorphizations. both have their place, but it’s nice to be able to read code and know basically exactly what it does.

# final thoughts

i’m quite happy with this project. the persistent config store, self-documentation, shell completions, interactive arrow-key menu and test suite make this feel like a more or less finished prototype.

mostly though zig suggests a different way of thinking about software for me, which is “what is the smallest correct thing i can write”.

that, i think, is what andrew was getting at to me last week. software is not bad because programmers are bad. software is bad because the dominant tools and the dominant culture (especially now with ai) push you toward more layers, more dependencies and more magic. zig feels like a small protest against that, which i’m happy to support.

now invite me to your awebo server :)
