# Deploy Manager

A web dashboard for managing Netlify deploys across teams and sites. Built with React and Netlify Functions, it provides a unified interface to browse teams, view sites, inspect production deploys, and perform deploy actions (publish, lock, unlock).

### Configure environment variables

Copy the example env file and add your Netlify access token:

```sh
cp .env.example .env
```

Edit `.env` and set your token:

```
NETLIFY_ACCESS_TOKEN=<your-netlify-personal-access-token>
```

You can generate a token at https://app.netlify.com/user/applications#personal-access-tokens.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/code-jorge/netlify-sites&base=deploy-manager#NETLIFY_ACCESS_TOKEN)
