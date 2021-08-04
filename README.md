# My Ichtus

[![Build Status](https://github.com/ecodev/my-ichtus/workflows/main/badge.svg)](https://github.com/ecodev/my-ichtus/actions)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Ecodev/my-ichtus/badges/quality-score.png?b=master&s=2b6588a62b5d35d80bd104014502605b7520f49a)](https://scrutinizer-ci.com/g/Ecodev/my-ichtus/?branch=master) &nbsp;
[![Code Coverage](https://scrutinizer-ci.com/g/Ecodev/my-ichtus/badges/coverage.png?b=master&s=cc2eec510484f44409973822e7e3a805df6a1e91)](https://scrutinizer-ci.com/g/Ecodev/my-ichtus/?branch=master)

## Introduction

My Ichtus is a web application based on GraphQL for the API and Angular for the client.

## Installation

The recommended way to get a working copy is the following:

1. Set up a nginx virtual host to point to `htdocs/` directory and to include `configuration/nginx.conf`
2. Create a database in MariaDB named "my-ichtus"
3. Configure database in `config/autoload/local.php` (see example `config/autoload/local.php.dist`)
4. Configure client in `client/assets/config/config.local.json` (see example `client/assets/config/config.dist.json`)
5. Finally, build the app:

```sh
./bin/build.sh
```

## Development

### Server

To switch the API to development (to enable logging), run:

```sh
composer development-enable
```

Logs will be available in `logs/all.log`.

#### Configuration caching

When in development mode, the configuration cache is
disabled, and switching in and out of development mode will remove the
configuration cache.

You may need to clear the configuration cache in production when deploying if
you deploy to the same directory. You may do so using the following:

```sh
$ composer clear-config-cache
```

### Client

Run `yarn dev` for a dev server. Navigate to `http://my-ichtus.lan:4200/`. The app will
automatically reload if you change any of the source files.

## Testing

### PHPUnit

PHPUnit tests require a reference database dump. When the dump is loaded it **will destroy**
existing database. This must be done once before running tests. Then each test is ran
within a transaction which is rolled back, so the database state is always predictable.

To run PHPunit test:

```sh
./bin/load-test-data.php
./vendor/bin/phpunit # as many times as necessary
```

### Karma

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
