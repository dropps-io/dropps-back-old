# Dropps back

## Table of contents:

# Pre-reqs

- Install [Node.js](https://nodejs.org/en/)
- Install Yarn
- An IDE (Intellij/Webstorm or VS Code)

# Getting started

- Install dependencies

```
npm install
```
- Create the `.env`, `.env.prod` and `.env.test` files and add the followings values inside:
```
DB_HOST="MYDATABASEHOST"
DB_NAME="MYDATABASENAME"
DB_USER="MYDATABASEUSER"
DB_PASSWORD="MYDATABASEPASSWORD"
HOST="HOSTURL"
```
***NOTE: `.env.test` need to contain only local config***

- Compile the typescript
```
yarn run build
```

- Serve the project to run it locally

```
yarn run "run dev"
```

# Dev guidelines

1) Create a new branch from develop following commit conventions (eg. feat/new-button)
2) Before commit, make sure to run `yarn run lint:fix` (fix errors and warnings) and `yarn run prettier`
3) When the work is done, create a pull request from your branch to the `develop` branch
4) Ask for some code review and approvals before accepting the pull request
5) Delete the branch you created if it's not used anymore

# Environments

### Development

The default environment that you use when you're developing and running the backend locally.

### Test

Local environment to run unit an automated tests.

### Staging

Environment used for our staging app (hosted and used for manual test).

**DO NOT RUN THIS ENVIRONMENT LOCALLY**

### Production

Production environment.

**DO NOT RUN THIS ENVIRONMENT LOCALLY**
# Release

- Create release branch `release/vX.X.X`

- Update the changelog file

```
yarn run release
```

- Check commit created and push
- Merge to the `main` branch

# Project Structure

## Dependencies

Dependencies are managed through `package.json`.
The package manager is yarn v1.
In that file you'll find two sections:

## `dependencies`

| Package                                | Description                                         |
| -------------------------------------- | --------------------------------------------------- |
| tslib                                  |                                                     |
| zone.js                                |                                                     |

## `devDependencies`

_This list is incomplete._

| Package                   | Description                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| eslint                    | Linter for JavaScript and TypeScript files                           |
| prettier                  | File formatting                                                      |
| standard-version          | Utility for versioning using Semver and generating CHANGELOG.        |
| typescript                | JavaScript compiler/type checker that boosts JavaScript productivity |

To install or update these dependencies you can use `yarn`.

## Testing

## Lint and format

### Formatting with Prettier

The format of the files is handled by Prettier.

- Run prettier

`yarn run prettier`

### Linting with ESLint

You can lint all files using ESLint.
The lint is included in the CI process.

- Lint

`yarn run lint`
- Lint with auto fix

`yarn run lint:fix`

## Commit conventions

The project adheres to the [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) guidelines.

### TLDR:

- `<type>[optional scope]: <description>`
- Start your commit messages with `[type]:`
    - Type can be:
        - "fix" for patches
        - "feat" for features
        - "refactor" for refactors
        - "docs" for documentation
        - "test" for tests
        - "perf" for code performance improvements
        - "style" for style
        - Other types are build, chore and ci
- If you introduce a breaking change, add "!" before the ":"
    - Eg. `refactor!: drop support for Node 6`
    - You can also add "BREAKING CHANGE: <description>" at the end of the commit message
