# Decap CMS GitHub OAuth on Cloudflare Pages

Decap CMS cannot use Netlify Identity or Netlify OAuth on Cloudflare Pages. The GitHub backend needs a server-side OAuth proxy, so this project uses Cloudflare Pages Functions:

- `/api/auth` starts the GitHub OAuth flow.
- `/api/callback` exchanges GitHub's temporary code for an access token and passes it back to Decap CMS.

## GitHub OAuth App

Create a GitHub OAuth App at GitHub Developer Settings.

- Application name: `HEX Design Labs CMS`
- Homepage URL: `https://hexdesignlabs.com`
- Authorization callback URL: `https://hexdesignlabs.com`

The function sends GitHub a `redirect_uri` of `https://hexdesignlabs.com/api/callback`. GitHub allows that because `/api/callback` is a subpath of the configured callback URL.

## Cloudflare Pages Environment Variables

In the Cloudflare Pages project, add these environment variables for Production and Preview:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Use the values from the GitHub OAuth App.

## Decap Config

`public/admin/config.yml` must keep:

```yaml
backend:
  name: github
  repo: hexdesignlabs/hexdesignlabs-site
  branch: development
  site_domain: https://hexdesignlabs.com
  base_url: https://hexdesignlabs.com
  auth_endpoint: /api/auth
```

Editors must have push access to `hexdesignlabs/hexdesignlabs-site`.
