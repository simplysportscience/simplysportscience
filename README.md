# AI practice marker: deployment steps

Files:
- worker.js: the Cloudflare Worker that holds the API key and calls Claude.
- wrangler.toml: Cloudflare configuration.
- test_worker.mjs: offline tests (run with `node test_worker.mjs`).

## 1. Create the Cloudflare account
Sign up at cloudflare.com with the school's or site owner's email. Free tier is enough to start.

## 2. Install the Cloudflare CLI
    npm install -g wrangler
    wrangler login

## 3. Store the Anthropic API key as a secret
Create the key in the Anthropic console, then run:
    wrangler secret put ANTHROPIC_API_KEY
Paste the key when asked. It is encrypted and never appears in the code or the web pages.

## 4. Deploy
From this folder:
    wrangler deploy
Wrangler prints a URL such as https://ssc-practice-marker.<your-subdomain>.workers.dev.
The marker endpoint is that URL plus /mark.

## 5. Connect the practice page
In ib-revision.html, replace the placeholder in this line with the endpoint:
    const MARKER_URL = 'https://YOUR-SUBDOMAIN.workers.dev/mark';
Until this is changed, the Mark my answer panel stays hidden.

## 6. Set limits before launch
- Spending limit: set a monthly usage limit in the Anthropic console.
- Rate limit: in the Cloudflare dashboard, add a rate-limiting rule on the path /mark (for example 10 requests per minute per visitor).
- Usage check: review the request count in the Cloudflare dashboard after the first week.

## Privacy
- The worker does not store or log answers. Cloudflare and Anthropic process the text to return feedback. Check the privacy terms of both before use.
- Under-18 students: the school's data policy should say whether students can use the marker and how answers are handled. Do not switch the panel on until that is agreed.

## Important
The code has been tested offline against a stand-in for the Claude API, but it has not yet been run against the live service. Test with a few real answers before students use it, and check that the marks match a teacher's judgement.
