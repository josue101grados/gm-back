# GMInfoleads V2 API

API built using nest framework for the GMInfoleads App

## Installation

Configure .env 
```bash
$ cp .env.example .env
```

### Important

The app needs a variable in the .env.example file called GOOGLE_APPLICATION_CREDENTIALS. This variable points to the `google-credentials.json` file with the corresponding Google credentials. For more information on how this file works and how to get it (visit this site)[https://cloud.google.com/docs/authentication/getting-started]

Install npm packages
```bash
$ npm install
```

Install CLI
```bash
$ npm install -g @nestjs/cli 
```

Run Elasticsearch container
```bash
$ docker-compose up -d
```

Run the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

App will be runnning in http://localhost:3000/

Swagger Documentation http://localhost:3000/api/

Elasticsearch http://localhost:9200

## Some commands

```bash
# generate module
$ nest g module modules/campaigns

# generate controller
$ nest g controller modules/campaigns

# generate service
$ nest g service modules/campaigns

# generate migration from existing entities
$ npm run typeorm migration:generate -- -n CreateCampaignsTable

# run migrations
$ npm run migration:run

# create a seeder
$ npm run seed:create UsersSeeder

# run seeder
$ npm run seed:run
```

## Tests
Both Controllers and Services must include a `.spec.ts` file for unit testing.
You should mock everything unrelated to the function you are testing for these files. Check the tests for WorkerRating as examples.

## Facebook Tokens
Tutorial: https://medium.com/@yasithlokuge/how-to-generate-a-never-expiring-facebook-page-access-token-24ac5c1a95f1

To generate new page token follow the next steps:
1. Log in into the Country Facebook Account
2. Go to Access Token Tool: https://developers.facebook.com/tools/accesstoken
3. Copy the User Token
4. Go to Access Token Debugger: https://developers.facebook.com/tools/debug/accesstoken
5. Paste copied token and debug, verify the Expire value is Never
6. Go to Graph API Explorer: https://developers.facebook.com/tools/explorer and paste the token 
7. Change the endpoint to me/accounts and execute the call
8. Copy one of the page tokens and use the Access Token Debugger to verify the Expire value is never.
9. Copy the whole response and replace in the access tokens file in /src/config/files/facebook_tokens.json

# Nest Documentation

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest
  
  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

  Nest is [MIT licensed](LICENSE).
