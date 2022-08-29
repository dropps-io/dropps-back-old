# LOOKSO SOCIAL FEED BACKEND

This is application that serves the social media feed, indexing Social media content, data about Universal Profiles and blockchain events.
* Indexes all Universal Profiles and their metadata.
* Indexes all Universal Profile events.
* Translates known blockchain events and their parameters to an informative, meaningful sentence.
* Indexes social media content

## Table of contents:

# Pre-reqs

- Install [Node.js](https://nodejs.org/en/)
- Install Yarn
- An IDE (Intellij/Webstorm or VS Code)

# Installation

1. Install postgreSQL 
2. Create a database
3. Use a postgres client to run the script under src/bin/db/scripts/create_db.sql

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

- Compile the typescript
```
npm run build
```


# Usage

Before running the server, you need to run the script to index blockchain data. 

```
npm run "run index-blockchain"
```

After this process is complete, fire up the server:

```
npm run "run dev"
```