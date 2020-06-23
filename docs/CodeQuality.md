# Code Quality Guidelines

In order to better-manage contributions from multiple authors an opinionated code styling system is imposed in the following way

## ESLint

[ESLint](https://eslint.org/) is a linting tool that automatically checks source files for consistency across defined rules. Configuration is defined in `.eslintrc` and can be run via

```
npm run lint
```

This will produce a list of all files that do not meet the imposed standards. By default inconsistencies have been setup to just be flagged as warnings, and so will not throw errors if incorporated into build processes.

Additionally, ESLint can apply fixes automatically for many common issues, to apply them run

```
npm run lint -- --fix
```

_Note the double -- -- is required to pass the --fix flag to the underlying eslint cli_

## Prettier

The set of rules used throughout the project are defined by a system called [Prettier](https://prettier.io/). This provides a sensible and thorough set of standards which integrate with most linters and code editors.

You can see default and available options within the [Prettier Docs](https://prettier.io/docs/en/options.html). Specific overrides for the project can be found in the `.prettierrc` file.

## Lint-staged and Husky

In a similar way to ESLint, Prettier can also automatically fix formatting inconsistencies across files. If using VSCode as editor then a `editor.formatOnSave` option is enabled to format files whenever saved. Additionally, tools [Lint-staged](https://www.npmjs.com/package/lint-staged) and [Husky](https://www.npmjs.com/package/husky) are included to automatically apply formatting to any staged files before they are committed into the repo. These can be configured via their respective blocks in `package.json`

## VSCode Recommended Setup

In order to have the smoothest developer experience (e.g. autocompletion, inline error notifications etc.), it is recommended that VSCode is used as the default code editor.

Additionally a list of recommended plugins is provided in `.vscode/estensions.json`, and will be prompted to install or can be found by searching the extension IDs from the vscode extensions marketplace.
