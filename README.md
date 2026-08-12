# Slack Clone

A Slack clone built using Express, GraphQL and React.

Based on the tutorial from https://awesomereact.com/playlists/slack-clone-using-graphql/0MKJ7JbVnFc.

## Running locally

- Requires PostgreSQL. If on a Mac use Homebrew to install. If not follow these instructions https://www.2ndquadrant.com/en/blog/pginstaller-install-postgresql/.
- Clone the repo at https://github.com/craigstroman/slack-clone-server.git.
- CD into slack-clone.
- Run `npm install` or `yarn install` to install all required Node moduels.
- Run `npm run live:server` or `yarn run live:server` to start server environment.
- To create a production version run `npm run prod:server` or `yarn prod:server`.
- <b>Note:</b> In the GraphQL query window turn on <b>Include Cookies</b> because I am using cookies for this.

Note: This is a work in progress. I'm continuing to update this and add features.

## Version History

###### Version 1.0.0

- Switched to using TypeScript
- Using TypeORM
- Using latest version of Apollo Server
- Using Redis
- Using PostgreSQL
