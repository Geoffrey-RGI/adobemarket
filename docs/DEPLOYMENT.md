# Cloudflare + Firebase Authentication

## Architecture

- Firebase Authentication: Google sign-in and email/password accounts, including password reset.
- Cloudflare Worker: the website, API, Firebase ID-token verification, authorization, and secure session cookie.
- D1 (`DB`): seller profiles, listings, photo metadata.
- R2 (`BUCKET`): uploaded photos. The bucket does not need public access.

No Firebase Admin private key is needed. The Worker verifies RS256 signatures against Google's published Firebase signing keys and checks issuer, audience/project, expiry, issued time, subject, and authentication time. It never trusts the old `oai-authenticated-user-id` header.

Firebase sessions use short-lived ID tokens. The client renews them through Firebase and syncs a Secure, HttpOnly, SameSite cookie for photo requests. Offline signature verification does not immediately detect admin-revoked sessions; tokens expire within their normal lifetime. Do not log authorization headers, cookies, or Firebase tokens.

The Firebase web app is registered as project `adobe-market`; its public web configuration is already filled into `wrangler.example.jsonc`. The D1 database `adobemarket` is configured with ID `07953b44-0e12-4696-89e4-b6e00a8f22cc` in the tracked `wrangler.jsonc`. The R2 bucket must still be created. Analytics is not enabled by the app code.

## 1. Firebase project

1. Create a project in https://console.firebase.google.com/ (Analytics is optional).
2. Register a **Web app**, named `Adobe Market` or your preferred display name.
3. Copy the public `projectId`, `apiKey`, `authDomain`, and `appId` into the Cloudflare configuration below. These identify the web app; they are not service-account secrets.
4. In **Authentication → Sign-in method**, enable **Google**, choose a project support email, and save.
5. Enable **Email/Password** and save. Email-link sign-in is not required.
6. Leave **Phone** disabled. The application does not send verification SMS. Sellers supply a phone number only as a public contact detail.
7. Add the final `adobemarket.<your-subdomain>.workers.dev` hostname (and later the custom domain) under **Authentication → Settings → Authorized domains**. Keep the default Firebase auth domain authorized.
8. Optionally configure Firebase's password policy and password-reset email template. New email accounts use Firebase's default password requirements unless a stronger policy is configured.


Never commit a service-account JSON file or private key. The application does not require either.

## 2. Cloudflare resources

In your Cloudflare account:

1. Create a D1 database named `adobemarket` and copy its database ID.
2. Create a private R2 bucket named `adobemarket-photos`. Enabling R2 may require account billing setup; review any prompt yourself.
3. The tracked `wrangler.jsonc` already includes the supplied D1 ID and public Firebase settings. Confirm the resources belong to the Cloudflare account used for deployment. Credentials must stay in account settings/secrets.

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

The configured `wrangler.jsonc` is committed. Create the R2 bucket before enabling automatic deployment. Apply remote D1 migrations before first production traffic and before changes that require new schema. The CI workflow in this repository runs tests; it does not independently deploy production.

If using GitHub Actions for deployment later, use narrowly scoped Cloudflare credentials in GitHub Actions secrets, never repository files or chat messages. No deployment credentials are configured by this repository.

## 5. Verify before launch

- Create an email/password account, sign out, sign back in, and test password reset.
- Sign in with Google and confirm the account can save a seller profile and publish a photo listing.
- Open a second browser/account and confirm that the listing appears.
- Confirm other accounts cannot edit, pause, or mark the seller's listing sold.
- Confirm anonymous browsing works, signout ends access, and own paused photos remain accessible only to the owner.
- Confirm phone numbers are only requested for seller contact and no SMS authentication flow appears.

Live provider verification requires configured projects and account access. Live chat uses D1 conversations and messages; the additive `0001_live_chat.sql` migration is required. Sellers and buyers arrange payment and transport themselves.

## Chat verification after deployment

Use a buyer account and a separate seller account in two browser sessions. Open a live listing as the buyer, send a message, and reply from the seller’s Messages inbox. Confirm replies appear automatically, history survives signout/sign-in, unread counts clear after opening a thread, and a third account cannot access it. Chat polls every five seconds while open; background badge counts refresh approximately every 20 seconds. Sample listings remain outside live results and never create real conversations.

## Admin dashboard rollout

The configuration contains the owner-supplied Firebase UID in `ADMIN_UIDS` (comma-separated UIDs are supported). Only Firebase-verified tokens whose UID is allowlisted grant admin access. Client-side visibility, an email address, or a request header cannot grant the role. No first-user registration or public admin signup exists.

The deployment command must apply `0002_moderation.sql` before publishing. Refresh the site after deployment, sign in with the designated owner account, and choose **Admin**, or use `/#admin`. Counts cover marketplace records; Accounts lists seller profiles and known buyers, not every Firebase sign-in.

Test with a separate buyer account: report a listing, review its evidence as admin, hide and restore the listing, and resolve the report with a reason. Confirm it disappears from anonymous search while hidden. Suspension blocks marketplace account actions and hides its listings; reinstatement preserves each listing's own status and moderation flag. Every moderation decision is recorded with the admin UID, target, time, and reason.

## Listing-review rollout

Run the additive `0003_listing_review.sql` migration via the existing deploy command. No backfill marks old listings as approved: they appear in the pending queue and are held from public search until explicitly reviewed. Prior photos, records, and conversations are retained.

After deployment, sign in as the designated admin and open **Reviews**. Inspect each listing and use the four-point information checklist before approval. Use **Request changes** to leave a note for the seller; the seller edits and resubmits from **My listings**. Reported listings are held for review. Review approval and report resolution are separate decisions.

Verify with a new seller: create a listing, confirm anonymous visitors cannot see it or its photo, approve it as admin, then confirm it is public. Request changes on another listing, confirm the seller sees the note, edit/resubmit, and approve again. A seller with a successful approval can publish subsequent listings directly. A “Listing reviewed” label appears only for explicitly reviewed, unchanged listing content.
