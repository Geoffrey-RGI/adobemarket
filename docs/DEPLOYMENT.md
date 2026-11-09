# Deployment decision

Recommended target for the existing implementation: Cloudflare Workers, with D1 for seller profiles and listings and R2 for produce photographs. This preserves the existing backend and SQL schema.

The repository is a working Sites application, not a finished independent Cloudflare deployment. The earlier Sites publish attempts did not make the new backend reachable at the live domain; this is not evidence that a direct Cloudflare deployment will fail.

## Authentication must be adapted before independent hosting

The current Worker trusts `oai-authenticated-user-id` because Sites dispatch authenticates requests and supplies that header. The `/signin-with-chatgpt` and `/signout-with-chatgpt` routes are also provided by Sites. An ordinary Worker does not provide those guarantees.

Before standalone publication, replace that identity lookup with server-verified sessions or ID tokens, reject unverified identity headers, and replace the frontend sign-in links. Firebase Authentication is one possible provider if phone sign-in is required; this does not require moving D1 or R2 to Firebase. Phone verification needs its own provider/project configuration and billing review.

## Direct Cloudflare deployment work

1. Implement and test the independent authentication adapter and sign-in interface.
2. Create D1 and R2 resources in the owner's Cloudflare account. Existing Sites-managed resources are not automatically transferred.
3. Add Wrangler configuration for the chosen account, `DB` and `BUCKET` bindings, and migration directory.
4. Apply schema migrations, build, and deploy with Wrangler or a GitHub integration.
5. Test real sign-in, upload, publication, separate buyer access, and denial of unauthorized edits on the deployed origin.
6. Connect a domain after successful verification.

The `.openai/hosting.json` file identifies the existing Sites project. It is not a standalone Wrangler configuration and contains no authentication secret. Data migration is separate from source-code migration.

## Firebase alternative

Firebase is attractive when managed phone authentication, realtime chat, and client-side offline support are the main priorities. A full Firebase backend would require migrating the SQL API to Firestore or another chosen Firebase database and replacing object storage and authorization integration. A Firebase-hosted frontend alone will not run this Cloudflare Worker backend.

No automatic production deployment is configured in this repository. CI builds and tests the code only.
