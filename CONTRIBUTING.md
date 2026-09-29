# Contributing to BionicJS

First off, thank you for considering contributing to BionicJS.

## Prerequisites

- Node.js 20 or later
- pnpm 11 or later (enabled through corepack or installed globally)

## Getting Started

1. Fork the repository and create your branch from main.
2. Install dependencies:

```sh
pnpm install
```

## Repository Layout

- packages/bionicjs: the core framework
- packages/dev: the vite and nitro based dev server and build pipeline
- packages/create-bionicjs-app: the CLI scaffolding tool
- packages/bionicjs-*: integration plugins for auth, databases, ai providers, and background jobs
- docs: the documentation site

## Development Workflow

1. Make your changes in the appropriate package.
2. Run typecheck and tests where applicable:

```sh
pnpm typecheck
pnpm test
```

3. Ensure your code follows the established style guidelines.

## Commit Messages

Commits follow Conventional Commits:

```
<type>: <short imperative summary in lowercase>
```

| Type | Purpose |
| --- | --- |
| feat | New user or developer facing capability |
| fix | Bug fix or correction of wrong content |
| docs | Documentation only changes |
| chore | Tooling, metadata, maintenance, no behavior change |

- Keep summaries lowercase and imperative.
- One logical change per commit and per pull request.
- No emojis in commit messages.

## Pull Request Process

- Keep each pull request focused on a single clear purpose.
- Fill out the pull request template so reviewers have the context they need.
- Update the README or docs when a change affects the interface or user visible behavior.
- Branches are merged with rebase and merge or a merge commit. Avoid squash merging so authored commits and their timestamps stay intact.

## Opening Issues

Use the issue templates. When opening a bug report, include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (operating system, node, pnpm, and package versions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License that covers this project.
