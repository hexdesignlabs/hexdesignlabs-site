# Decap CMS GitHub OAuth on Cloudflare Pages

Decap CMS cannot use Netlify Identity or Netlify OAuth on Cloudflare Pages. The GitHub backend needs a server-side OAuth proxy, so this project uses Cloudflare Pages Functions:

- `/api/auth` starts the GitHub OAuth flow.
- `/api/callback` exchanges GitHub's temporary code for an access token and passes it back to Decap CMS.

The functions read OAuth credentials from the Cloudflare Pages Functions runtime binding object: `context.env`. Do not use `process.env`, and do not hard-code the GitHub secret.

## Production URL

For production, Decap is configured for:

- Admin URL: `https://hexdesignlabs.com/admin`
- OAuth base URL: `https://hexdesignlabs.com`
- Auth endpoint: `/api/auth`
- Git branch edited by Decap: `main`

## Development Preview URL

While testing the development branch before merge, Decap can temporarily be configured for:

- Admin URL: `https://development.hexdesignlabs-site.pages.dev/admin`
- OAuth base URL: `https://development.hexdesignlabs-site.pages.dev`
- Auth endpoint: `/api/auth`
- Git branch edited by Decap: `development`

Do not merge preview-specific `base_url`, `site_domain`, or `branch: development` values into production.

## GitHub OAuth App

Create a GitHub OAuth App at GitHub Developer Settings.

- Application name: `HEX Design Labs CMS`
- Homepage URL: `https://hexdesignlabs.com`
- Authorization callback URL: `https://hexdesignlabs.com/api/callback`

The function sends GitHub a `redirect_uri` of `https://hexdesignlabs.com/api/callback`, so the GitHub OAuth App must allow that exact callback URL.

## Cloudflare Pages Runtime Secrets

In the Cloudflare Pages project, add both OAuth values as encrypted runtime secrets for the Production environment:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Optional but recommended:

- `GITHUB_REDIRECT_URI` set to `https://hexdesignlabs.com/api/callback`

Use the values from the GitHub OAuth App.

Dashboard path:

1. Go to Cloudflare dashboard.
2. Open Workers & Pages.
3. Select the Pages project.
4. Go to Settings > Variables and Secrets.
5. Select the Production environment.
6. Add `GITHUB_CLIENT_ID`.
7. Add `GITHUB_CLIENT_SECRET`.
8. Optionally add `GITHUB_REDIRECT_URI` with `https://hexdesignlabs.com/api/callback`.
9. Select Encrypt for secret values.
10. Make sure the variables are runtime variables/secrets for Pages Functions, not build-only variables.
11. Redeploy the production branch after saving them. A deployment created before the variables were saved will not receive them.

Important: if `/api/auth` lists `context.env` keys like `CF_PAGES`, `CF_PAGES_BRANCH`, `PUBLIC_*`, and `ASSETS`, but not `GITHUB_CLIENT_ID` or `GITHUB_CLIENT_SECRET`, the function code is running correctly. The OAuth values are not attached to that deployment's runtime environment.

In that case, check these Cloudflare settings:

- The values exist in the same Pages project that serves `hexdesignlabs.com`.
- The values are set under the Production environment. Preview-only variables will not appear on production.
- The values are runtime variables/secrets available to Pages Functions. Build-only variables can be visible during `npm run build` but unavailable in `context.env` at request time.
- The deployment was created after the variables were saved. Trigger a fresh deployment after saving the secrets.
- The variable names match exactly: `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

Do not add these OAuth values as public variables. `GITHUB_CLIENT_SECRET` must be a secret, because Pages Functions access secrets and environment variables through `context.env`.

## Decap Config

`public/admin/config.yml` must keep this for production:

```yaml
backend:
  name: github
  repo: hexdesignlabs/hexdesignlabs-site
  branch: main
  site_domain: https://hexdesignlabs.com
  base_url: https://hexdesignlabs.com
  auth_endpoint: /api/auth
```

Editors must have push access to `hexdesignlabs/hexdesignlabs-site`.
