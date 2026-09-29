## The pipeline

Continuous integration and delivery for a bionicjs project follows the same
shape as any Node + Python app: install dependencies, run checks, build,
deploy. The build contract is standard — `npm run build` produces the
`.output/` directory that every deployment target consumes.

## Install and check

Install TypeScript and Python dependencies, then run the checks your
project relies on:

```bash
npm ci
pip install -r requirements.txt
npm run lint && npm test
```

## Build

`npm run build` compiles the client, the server, and the Python layer
into a single artifact. The same command that runs locally is the one CI
runs, so a green build is a deployable build.

## Deploy

Ship the `.output/` directory to any supported target — GitHub Actions
can push to Vercel, Cloudflare, Railway, or a container registry. Each
target's preset carries the platform-specific configuration.

## Examples

The patterns above map to real workflow files in the platform docs:
GitHub Actions for CI, and the Deployment section for each target's
publish step.