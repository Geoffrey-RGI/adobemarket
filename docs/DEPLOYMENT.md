# Cloudflare + Firebase Authentication

## Architecture

- Firebase Authentication: Ghana phone-number sign-in with reCAPTCHA and SMS codes.
- Cloudflare Worker: the website, API, Firebase ID-token verification, authorization, and secure session cookie.
- D1 (`DB`): seller profiles, listings, photo metadata.
- R2 (`BUCKET`): uploaded photos. The bucket does not need public access.

No Firebase Admin private key is needed. The Worker verifies RS256 signatures against Google's published Firebase signing keys and checks issuer, audience/project, expiry, issued time, subject, and authentication time. It never trusts the old `oai-authenticated-user-id` header.

Firebase sessions use short-lived ID tokens. The client renews them through Firebase and syncs a Secure, HttpOnly, SameSite cookie for photo requests. Offline signature verification does not immediately detect admin-revoked sessions; tokens expire within their normal lifetime. Do not log authorization headers, cookies, or Firebase tokens.

The Firebase web app is registered as project `adobe-market`; its public web configuration is already filled into `wrangler.example.jsonc`. The D1 database ID still needs to be supplied. Analytics is not enabled by the app code.

## 1. Firebase project

1. Create a project in https://console.firebase.google.com/ (Analytics is optional).
2. Register a **Web app**, named `Adobe Market` or your preferred display name.
3. Copy the public `projectId`, `apiKey`, `authDomain`, and `appId` into the Cloudflare configuration below. These identify the web app; they are not service-account secrets.
4. In **Authentication → Sign-in method**, enable **Phone**.
5. Check the project's billing requirements for real SMS before enabling paid use. Set SMS region policy to allow Ghana and only any other countries you intentionally support.
6. Under phone-provider testing, add a fictional test number and code. Use it for setup verification without sending a paid SMS. Keep test codes out of the repository.
7. Add the final `adobemarket.<your-subdomain>.workers.dev` hostname (and later the custom domain) under **Authentication → Settings → Authorized domains**.

Never commit a service-account JSON file or private key. The application does not require either.

## 2. Cloudflare resources

In your Cloudflare account:

1. Create a D1 database named `adobemarket` and copy its database ID.
2. Create a private R2 bucket named `adobemarket-photos`. Enabling R2 may require account billing setup; review any prompt yourself.
3. Copy `wrangler.example.jsonc` to `wrangler.jsonc` and replace every `REPLACE_WITH_...` value. Account-specific IDs and public Firebase config may be committed deliberately, but credentials must stay in account settings/secrets.

The project includes the `wrangler` CLI. For local setup:

```sh
npm ci
npx wrangler login
npx wrangler d1 create adobemarket
npx wrangler r2 bucket create adobemarket-photos
```

Use either dashboard creation or these creation commands, not both for the same resource. Wrangler returns the D1 ID. Fill the configuration before continuing.

## 3. Build, migrate, deploy

```sh
npm run build
npm test
npm run db:migrate:remote
npm run deploy
```

`wrangler.jsonc` is required for the final two commands. SQL migrations are schema-only and run with Wrangler's D1 migration tracker. Do not replay a migration manually. Existing Sites-managed data/resources are not automatically moved to your own account; migrate any real records separately.

The old `.openai/hosting.json` is retained only as a reference to the original prototype; this standalone build does not use it or deploy back to Sites.

## 4. Connect GitHub through Cloudflare

Under **Workers & Pages**, use the option to import/connect an existing Git repository and select `Geoffrey-RGI/adobemarket`. Authorize that repository in the Cloudflare GitHub installation if requested.

- Production branch: `main`
- Root directory: repository root
- Build command: `npm run build`
- Deploy command: `npm run deploy`

Commit a configured `wrangler.jsonc` before enabling automatic deployment. Apply remote D1 migrations before first production traffic and before changes that require new schema. The CI workflow in this repository runs tests; it does not independently deploy production.

If using GitHub Actions for deployment later, use narrowly scoped Cloudflare credentials in GitHub Actions secrets, never repository files or chat messages. No deployment credentials are configured by this repository.

## 5. Verify before launch

- Sign in with the Firebase test phone, save a seller profile, and publish a photo listing.
- Open a second browser/account and confirm that the listing appears.
- Confirm other accounts cannot edit, pause, or mark the seller's listing sold.
- Confirm anonymous browsing works, signout ends access, and own paused photos remain accessible only to the owner.
- Finally test one real Ghana SMS after reviewing billing and region policy.

Live cloud/SMS verification requires configured projects and account access. In-app chat is a separate next phase. Sellers and buyers arrange payment and transport themselves.
