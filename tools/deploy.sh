#!/bin/bash

git checkout -- .
git pull
composer install --no-dev
bin/console d:s:u --force
#yarn install --production
yarn install
yarn build
