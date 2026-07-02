# Decap CMS GitHub OAuth on Cloudflare Pages

Decap CMS cannot use Netlify Identity or Netlify OAuth on Cloudflare Pages. The GitHub backend needs a server-side OAuth proxy, so this project uses Cloudflare Pages Functions:

- `/api/auth` starts the GitHub OAuth flow.
- `/api/callback` exchanges GitHub's temporary code for an access token and passes it back to Decap CMS.

The functions read OAuth credentials from the Cloudflare Pages Functions runtime binding object: `context.env`. Do not use `process.env`, and do not hard-code the GitHub secret.

## Development Preview URL

While testing the development branch, Decap is configured for:

- Admin URL: `https://development.hexdesignlabs-site.pages.dev/admin`
- OAuth base URL: `https://development.hexdesignlabs-site.pages.dev`
- Auth endpoint: `/api/auth`

## GitHub OAuth App

Create a GitHub OAuth App at GitHub Developer Settings.

- Application name: `HEX Design Labs CMS`
- Homepage URL: `https://development.hexdesignlabs-site.pages.dev`
- Authorization callback URL: `https://development.hexdesignlabs-site.pages.dev`

The function sends GitHub a `redirect_uri` of `https://development.hexdesignlabs-site.pages.dev/api/callback`. GitHub accepts that because `/api/callback` is a subpath of the configured callback URL.

## Cloudflare Pages Runtime Secrets

In the Cloudflare Pages project, add both OAuth values as encrypted runtime secrets for the Preview environment:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Use the values from the GitHub OAuth App.

Dashboard path:

1. Go to Cloudflare dashboard.
2. Open Workers & Pages.
3. Select the Pages project.
4. Go to Settings > Variables and Secrets.
5. Select the Preview environment, not only Production.
6. Add `GITHUB_CLIENT_ID`.
7. Add `GITHUB_CLIENT_SECRET`.
8. Select Encrypt for the values.
9. Make sure the variables are runtime variables/secrets for Pages Functions, not build-only variables.
10. Redeploy the `development` branch after saving them. A deployment created before the variables were saved will not receive them.

Important: if `/api/auth` lists `context.env` keys like `CF_PAGES`, `CF_PAGES_BRANCH`, `PUBLIC_*`, and `ASSETS`, but not `GITHUB_CLIENT_ID` or `GITHUB_CLIENT_SECRET`, the function code is running correctly. The OAuth values are not attached to that deployment's runtime environment.

In that case, check these Cloudflare settings:

- The values exist in the same Pages project that serves `development.hexdesignlabs-site.pages.dev`.
- The values are set under the Preview environment. The `development.hexdesignlabs-site.pages.dev` URL is a preview deployment, so Production-only variables will not appear there.
- The values are runtime variables/secrets available to Pages Functions. Build-only variables can be visible during `npm run build` but unavailable in `context.env` at request time.
- The deployment was created after the variables were saved. Trigger a fresh deployment after saving the secrets.
- The variable names match exactly: `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

Do not add these OAuth values as public variables. `GITHUB_CLIENT_SECRET` must be a secret, because Pages Functions access secrets and environment variables through `context.env`.

## Decap Config

`public/admin/config.yml` must keep this for development preview testing:

```yaml
backend:
  name: github
  repo: hexdesignlabs/hexdesignlabs-site
  branch: development
  site_domain: https://development.hexdesignlabs-site.pages.dev
  base_url: https://development.hexdesignlabs-site.pages.dev
  auth_endpoint: /api/auth
```

Editors must have push access to `hexdesignlabs/hexdesignlabs-site`.
