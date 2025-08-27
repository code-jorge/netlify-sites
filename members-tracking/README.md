# Netlify Members Experiment

This project captures members and committers belonging to an account at different times.

It uses:

- **Netlify Functions**: Serverless functions in `netlify/functions/` to interact with the Netlify API and store member data snapshots.
- **Scheduled Functions**: The `fetch-members` function is scheduled to run hourly (see `netlify.toml`).
- **Blob Storage**: Uses Netlify Blobs to persist daily member snapshots to `members/snapshots.json`.


It requires: 

- Setting up `NETLIFY_API_TOKEN` with an access token for Netlify, you can create one in your [Netlify user settings](https://app.netlify.com/user/applications#personal-access-tokens).

---


[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/code-jorge/netlify-sites&base=members-tracking#NETLIFY_API_TOKEN)