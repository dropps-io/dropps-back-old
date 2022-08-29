# LOOKSO SOCIAL FEED BACKEND

This is the application that serves the social media eed, indexing content, data about Universal Profiles and blockchain events.
* Indexes all Universal Profiles and their metadata.
* Indexes all Universal Profile events.
* Translates known blockchain events and their parameters to an informative, meaningful sentence.
* Indexes social media content


# Installation

1. Install postgreSQL 
2. Create a database
3. Use a postgres client to run the script under src/bin/db/scripts/create_db.sql
4. Install dependencies with:

```
npm install
```

5. Create the `.env`, `.env.prod` and `.env.test` files and add the followings values inside:
```
DB_HOST="MYDATABASEHOST"
DB_NAME="MYDATABASENAME"
DB_USER="MYDATABASEUSER"
DB_PASSWORD="MYDATABASEPASSWORD"
HOST="HOSTURL"
JWT_SECRET = "YOURJWTSECRET"
```

For example:
```
DB_HOST="127.0.0.1"
DB_NAME="lookso_dev"
DB_USER="postgres"
DB_PASSWORD="admin "
HOST="127.0.0.1"
JWT_SECRET = "YOURJWTSECRET"
```

***NOTE: `.env.test` need to contain only local config***

- Compile the typescript // <------------ Needed?
```
npm run build
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