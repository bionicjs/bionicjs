## Commands

The bionicjs CLI is small by design. A project is created once and then
driven by two commands.

| Command | What it does |
|---|---|
| `npx bionicjs init` | Scaffold a new project from the base and selected templates |
| `npx bionicjs dev` | Start the Vite client and Nitro server together with HMR |
| `npx bionicjs build` | Build the client, server, and Python layer into `.output/` |

## dev

`bionicjs dev` starts both processes: Vite on the client for HMR, Nitro on
the server, with the `/api` proxy between them. One terminal, one
origin, everything watched.

## build

`bionicjs build` compiles the full application — client bundle, server
handlers, and Python runtime — into the standard `.output/` directory
that every deployment target consumes.

## init

`init` applies the base template first, then each template you select in
order, merging files according to the merge strategy. Re-running it is
safe: existing files are honored.