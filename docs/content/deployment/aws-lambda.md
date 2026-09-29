Deploy your bionicjs project to AWS Lambda. The Lambda preset bundles the Nitro server into a handler that AWS Lambda invokes on demand — you own the whole AWS stack, from the API Gateway trigger to IAM and whatever database you choose.

## Configure

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";

export default defineConfig({
  nitro: { preset: "aws_lambda" },
});
```

```bash
npm run build   # produces a deployable .output/
# point your API Gateway or function URL at the generated handler
```

## What you get

- The server runs as a serverless function, scaled and billed per invocation.
- Static `app/` assets served from S3 + CloudFront in front of the API.
- Full control over networking with an existing VPC.

## Good to know

- Deploy the `.output/` directory to Lambda and set the handler path that Nitro's `aws_lambda` preset emits.
- Wire `DATABASE_URL` and secrets through Lambda environment variables or AWS Secrets Manager.
- Keep per-invocation CPU and latency limits in mind; move long-running Python AI/agent work to the `jobs/` workers or a dedicated service.