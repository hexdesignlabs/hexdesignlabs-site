# HEX Design Labs Website Launch Plan

## Goal

Build a custom-coded Astro site, deploy it safely through GitHub and Cloudflare Pages, and add CMS-managed content, protected contact forms, email marketing, analytics, and search tooling without disrupting the live site.

## Planned Stack

- Astro
- GitHub
- Cloudflare Pages
- Cloudflare DNS
- Decap CMS
- Formspark
- Cloudflare Turnstile
- Mailchimp
- Google Analytics
- Google Search Console

## Launch Plan

1. Create the custom-coded Astro site locally.
2. Push source changes to GitHub when ready.
3. Deploy the GitHub repo through Cloudflare Pages.
4. Use Cloudflare Pages preview links as staging before production changes.
5. Add Decap CMS for editable blog and portfolio content.
6. Receive contact form submissions by email through Formspark.
7. Protect forms from spam with Cloudflare Turnstile.
8. Connect Mailchimp for email marketing workflows.
9. Connect Google Analytics and Google Search Console.
10. Launch safely without breaking the current live site.

## Current Notes

- This project is already initialized as a local Git repo.
- The GitHub remote is configured as `https://github.com/hexdesignlabs/hexdesignlabs-site.git`.
- The project has not been pushed to GitHub yet.
- The contact form is Formspark/Turnstile-ready with development placeholders.
- Formspark has been created and the local form endpoint is set to `https://submit-form.com/tVTMartFI`.
- Cloudflare Turnstile has been created for the contact form, and the local public sitekey is set.
- Decap setup can wait until that account/configuration is needed.

## Future Form Setup

Formspark and Cloudflare Turnstile are partially configured locally.

Current local environment values:

```bash
PUBLIC_FORMSPARK_ACTION_URL=https://submit-form.com/tVTMartFI
PUBLIC_TURNSTILE_SITEKEY=0x4AAAAAADHMiWGAEl9zW3nc
```

Before Cloudflare Pages deployment:

1. Add `PUBLIC_FORMSPARK_ACTION_URL` to Cloudflare Pages environment variables.
2. Add `PUBLIC_TURNSTILE_SITEKEY` to Cloudflare Pages environment variables.
3. Confirm Formspark is configured to validate the Turnstile token server-side using the private Turnstile secret key.
4. Test a real submission in a Cloudflare Pages preview before production launch.
