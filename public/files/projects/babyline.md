# babyline

## A small Zig command-line app

babyline is a small Zig CLI demo, originally built by following a terminal/CLI guide and extended from there into a typed command and option parser with a test suite and auto-generated docs.

### Technologies Used
- Zig

### Commands
- `hello` — greet someone (`-g/--greeting`, `-n/--name`)
- `user:create` — create a user (`-u/--username`)
- `user:list` — list users
- `config:set` — set a config value (`-k/--key`, `-v/--value`)
- `config:get` — get a config value (`-k/--key`)
- `help` — show the help message

### Features
- A typed parser distinguishing required vs. optional options per command.
- A test suite run with `zig build test`.
- An auto-generated CLI reference: `zig build docs` regenerates the `docs/` output and the README's command reference from `src/docs.zig`, so the documentation never drifts from the code.

### Build
```
zig build           # binary -> ./zig-out/bin/babyline
zig build test      # run the test suite
zig build docs      # regenerate docs/ and the CLI reference
```

### GitHub Repository
For more details and to view the source code, visit the [GitHub repository](https://github.com/andrewlidong/babyline).
