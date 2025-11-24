# Webhook testing (local development)

This document explains how to test GitHub webhooks locally using `ngrok` and the webhook endpoints provided by this project.

Prerequisites
- `node` and `npm` installed
- `ngrok` installed (https://ngrok.com/)
- Backend running (default `http://localhost:3000`)

1) Start backend

```bash
cd Backend
npm install
node app.js
```

2) Expose your local server with ngrok

Run ngrok to forward HTTPS traffic to your local port 3000:

```bash
ngrok http 3000
```

You will get a public HTTPS URL like `https://abcd1234.ngrok.io` — copy this URL.

3) Configure webhook URL and secret

Set environment variables (or edit `.env`) before creating the webhook:

```bash
export WEBHOOK_URL="https://abcd1234.ngrok.io/api/github/webhook"
export WEBHOOK_SECRET="your-secret-here"
```

Restart the backend if you changed env vars.

4) Create webhook via the app

- Use the frontend `Setup Webhook` button in the repository card (recommended) — this will call `POST /api/repos/select` on the backend which uses the authenticated user's GitHub token to create a webhook on the selected repo.
- Alternatively, create a webhook manually via curl (replace owner/repo and `GH_TOKEN`):

```bash
curl -X POST \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/OWNER/REPO/hooks \
  -d '{
    "name": "web",
    "active": true,
    "events": ["push"],
    "config": {
      "url": "https://abcd1234.ngrok.io/api/github/webhook",
      "content_type": "json",
      "secret": "your-secret-here"
    }
  }'
```

5) Trigger a push event

Push to the repository or use the `RecentDeliveries` in the GitHub Webhooks settings to trigger a delivery.

6) Observe backend logs

When a push event is received and the signature is valid, the backend will parse the repo, branch and commit ID and call `runCustomPipeline` which currently logs the details to the server console.

7) Troubleshooting
- If you receive signature verification errors, ensure the webhook `secret` configured in GitHub matches `WEBHOOK_SECRET` used by the backend.
- Ensure your ngrok URL is HTTPS and the `WEBHOOK_URL` uses the ngrok HTTPS URL.

Feel free to add additional notes here for your team's workflow.
