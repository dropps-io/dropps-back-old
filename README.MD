# LOOKSO Social Media Feed Backend

This is the application that serves the social media feed, indexing created content and data about Universal Profiles and blockchain events. It:

* Indexes all Universal Profiles and their metadata.
* Indexes all Universal Profile events.
* Translates known blockchain events and their parameters to an informative, meaningful sentence.
* Indexes social media content

The API Documentation can be found [here](https://api.lookso.io/documentation/static/index.html).

# Installation

1. Install postgreSQL 
2. Create a database
3. Use a postgres client to run the script under src/bin/db/scripts/create_db.sql
4. Install dependencies with:

```
npm install
```

5. Create the `.env`, `.env.staging`, `.env.prod` and `.env.test` files and add the followings values inside:
```
DB_HOST="MYDATABASEHOST"
DB_NAME="MYDATABASENAME"
DB_USER="MYDATABASEUSER"
DB_PASSWORD="MYDATABASEPASSWORD"
HOST="HOSTURL"
JWT_SECRET = "YOURJWTSECRET"
ARWEAVE_WALLET="YOURWALLETOBJECT"
```

For example:
```
DB_HOST="127.0.0.1"
DB_NAME="lookso_dev"
DB_USER="postgres"
DB_PASSWORD="superpassword"
HOST="127.0.0.1"
JWT_SECRET = "YOURJWTSECRET"
ARWEAVE_WALLET="{"kty": "RSA", "n": "", "e": "", etc...}"
```

# Usage

Before running the server, you need to run a few scripts in the following order, to prepare the database and fetch data from the blockchain.

```
npm run "run fill-db"
```

```
npm run "run set-displays"
```

```
npm run "run index-blockchain"
```

After this process is complete, fire up the server:

```
npm run "run dev"
```

## Project Structure

The most obvious difference in a TypeScript + Node project is the folder structure.
In a TypeScript project, it's best to have separate _source_ and _distributable_ files.
TypeScript (`.ts`) files live in your `src` folder and after compilation are output as JavaScript (`.js`) in the `dist` folder.
The `test` and `views` folders remain top level as expected.

The full folder structure of this app is explained below:

> **Note!** Make sure you have already built the app using `yarn run build`

| Name                             | Description                                                                                                                                                                 |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **dist**                         | Contains the distributable (or output) from your TypeScript build. This is the code you ship                                                                                |
| **node_modules**                 | Contains all your npm dependencies                                                                                                                                          |
| **config**                       | Contains all the config files (one per environment)                                                                                                                         |
| **src**                          | Contains your source code that will be compiled to the dist dir                                                                                                             |
| **src/environment**              | Contains constants and the endpoints for the config and .env files                                                                                                          |
| **src/lib**                      | Define functions that respond to various http requests                                                                                                                      |
| **src/bin**                      | Contains all the services of the backend                                                                                                                                    |
| **src/models**                   | Models define json schemas that will be used in storing and retrieving data from Postgres, and holds .d.ts files not found on DefinitelyTyped. Covered more in this section |
| **src/scripts**                  | Scripts being used for the DROPPS apps (mostly to fill the database)                                                                                                        |
| **src/scripts/new-index-script** | Script being used to index and persist in our DB in real time, all the information from a blockchain (L16 Lukso network)                                                    |
| **src/test**                     | Contains your tests. Separate from source because there is a different build process.                                                                                       |
| .env.example                     | API keys, tokens, passwords, database URI. Clone this, but don't check it in to public repos.                                                                               |
| package.json                     | File that contains npm dependencies as well as [build scripts](#what-if-a-library-isnt-on-definitelytyped)                                                                  |
| tsconfig.json                    | Config settings for compiling server code written in TypeScript                                                                                                             |
| tsconfig.tests.json              | Config settings for compiling tests written in TypeScript                                                                                                                   |
| .eslintrc.json                   | Config settings for ESLint code style checking                                                                                                                              |
| .eslintignore                    | Config settings for paths to exclude from linting                                                                                                                           |
