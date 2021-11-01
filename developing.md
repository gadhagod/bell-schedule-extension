# Developing

## Setup
Prequisites:
* [Git](https://git-scm.com)
* [Chrome](https://www.google.com/chrome)
* [Node.js](https://nodejs.org/en)
* [npm](https://www.npmjs.com)
* Possibly, a [fork of this repo](https://github.com/gadhagod/bell-schedule-extension/fork).

1. Clone this repository and change directory.

2. Install the development packages.
```
npm i -g bower eslint uglify-js
```
3. Install the web components.
```
sh scripts/install-components.sh # mac
bash scripts/install-components # windows
```
4. [Load the extension](https://youtu.be/19UZcGczmbA)'s `src` directory.

## Preparing for Production
The process of preparing the extension for production includes minification and removal of non-essential files:

1. Work through the [setup](#setup) steps.
2. Copy the src directory to `dist`. 
3. Minify `dist/index.js`.
```
uglifyjs dist/index.js -o dist/index.js
```
4. Commit and push `dist`'s files to the `dist` branch. 

These steps are automatically executed on all commits to `master` by the [`Deploy`](https://github.com/gadhagod/bell-schedule-extension/actions/workflows/deploy.yml) workflow.

## Linting
This project uses [ESLint](https://eslint.org) for linting purposes.

Linting without fixes:

    eslint src --ext .js

Linting with fixes:

    eslint src --ext .js --fix

Lint errors are also reported on pushes that change the `src` directory by the [`Lint`](https://github.com/gadhagod/bell-schedule-extension/actions/workflows/lint.yml) workflow.

## Documentation
Documentation is built through [Docsify](https://docsify.js.org). 

Run locally:

    npm serve .

Changes are auto-deployed on releases through GitHub pages.