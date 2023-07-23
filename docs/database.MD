# Database Schema Documentation

This documentation describes the tables and columns of the database schema.

## Schema

![db_schema.png](schemas%2Fdb_schema.png)

## Tables

### asset

This table stores asset information.

- Column `address` references the `contract` table's `address` column.

Asset present in the metadata of a smart contract (generally `LSP7` and `LSP8`).

| Column   | Data Type             | Constraint | Description                              | Example             |
|----------|-----------------------|------------|------------------------------------------|---------------------|
| address  | character(42)         | NOT NULL   | Asset address                            | 0x0000...0000       |
| url      | character varying     | NOT NULL   | Asset URL                                | https://someurl.com |
| fileType | character varying(10) | NOT NULL   | Asset file type (MIME or file extension) | image/png OR png    |
| hash     | character(66)         | NOT NULL   | Asset content hash                       | 0x00000...0000      |

### config

This table stores some application configuration as a key/value store.

| Column | Data Type         | Constraint | Description         | Example             |
|--------|-------------------|------------|---------------------|---------------------|
| key    | character varying | NOT NULL   | Configuration key   | max_file_size_in_mb |
| value  | character varying |            | Configuration value | 24                  |

### contract

This table stores information about the indexed contracts.

| Column        | Data Type         | Constraint | Description             | Example          |
|---------------|-------------------|------------|-------------------------|------------------|
| address       | character(42)     | NOT NULL   | Contract address        | 0x1234.....56789 |
| interfaceCode | character varying |            | Contract interface code | LSP7             |

### contract_interface

This table stores contract interface information. A contract interface represents an ethereum or LUKSO standard (e.g. ERC20 OR LSP7)

| Column | Data Type         | Constraint | Description    | Example                    |
|--------|-------------------|------------|----------------|----------------------------|
| code   | character varying | NOT NULL   | Interface code | LSP7                       |
| id     | character(10)     | NOT NULL   | Interface ID   | 0x12345678                 |
| name   | character varying | NOT NULL   | Interface name | Identifiable Digital Asset |

### contract_metadata

This table stores a contract metadata (not every contract have metadata).

- Column `address` references the `contract` table's `address` column.

| Column      | Data Type         | Constraint | Description                                     |
|-------------|-------------------|------------|-------------------------------------------------|
| address     | character(42)     | NOT NULL   | Contract address                                |
| name        | character varying | NOT NULL   | Contract name                                   |
| symbol      | character varying | NOT NULL   | Contract symbol                                 |
| description | character varying | NOT NULL   | Contract description                            |
| isNFT       | boolean           | NOT NULL   | Indicates whether the contract is an NFT or not |
| supply      | character varying | NOT NULL   | Contract supply                                 |

### data_changed

This table saves DataChanged events emitted by the ERC725Y contracts, in order to keep a history of the values.

- Column `address` references the `contract` table's `address` column.

| Column      | Data Type         | Constraint | Description      | Example      |
|-------------|-------------------|------------|------------------|--------------|
| address     | character(42)     | NOT NULL   | Contract address | 0x0000...000 |
| key         | character(66)     | NOT NULL   | Bytes32 data key | 0x0000...000 |
| value       | character varying | NOT NULL   | Data value       | 0x0000...000 |
| blockNumber | integer           | NOT NULL   | Block number     | 123456       |

### decoded_event_parameter

This table stores decoded parameters associated to an indexed blockchain event.

- Column `eventId` references the `event` table's `id` column.

| Column      | Data Type         | Constraint | Description            | Example |
|-------------|-------------------|------------|------------------------|---------|
| eventId     | integer           | NOT NULL   | Event ID               | 1       |
| value       | character varying | NOT NULL   | Parameter value        | Samuel  |
| name        | character varying | NOT NULL   | Parameter name         | name    |
| type        | character varying | NOT NULL   | Parameter type         | string  |
| displayType | character varying |            | Parameter display type | string  |     

### decoded_function_parameter

This table stores decoded parameters associated to an indexed contract transaction.

- Column `transactionHash` references the `transaction` table's `hash` column.

| Column          | Data Type         | Constraint | Description            | Example       |
|-----------------|-------------------|------------|------------------------|---------------|
| transactionHash | character(66)     | NOT NULL   | Transaction hash       | 0x00000...000 |
| value           | character varying |            | Parameter value        | 123           |
| name            | character varying |            | Parameter name         | quantity      |
| type            | character varying |            | Parameter type         | uint16        |
| displayType     | character varying |            | Parameter display type | number        |

### erc725y_schema

This table stores an ERC725Y schema.
This is used to decode unknown keys and values fetched from the blockchain. 
When a `DataChanged` event is emitted, we then can check if the key is present in our database, in order to decode the value and know the context.

| Column       | Data Type         | Constraint | Description   |
|--------------|-------------------|------------|---------------|
| keyName      | character varying | NOT NULL   | Key name      |
| keyType      | character varying | NOT NULL   | Key type      |
| valueType    | character varying | NOT NULL   | Value type    |
| valueContent | character varying | NOT NULL   | Value content |
| valueDisplay | character varying |            | Value display |

### event

This table stores information about indexed events. Those events are associated to a post that will be displayed on the Lookso feed page.

- Column `address` references the `contract` table's `address` column.
- Column `transactionHash` references the `transaction` table's `hash` column.

| Column          | Data Type         | Constraint | Description         | Example     |
|-----------------|-------------------|------------|---------------------|-------------|
| id              | integer           | NOT NULL   | Event ID            | 1           |
| address         | character(42)     | NOT NULL   | Contract address    | 0x000...000 |
| transactionHash | character(66)     | NOT NULL   | Transaction hash    | 0x000...000 |
| logId           | character(8)      | NOT NULL   | Log ID              | w234gd2d    |
| blockNumber     | integer           | NOT NULL   | Block number        | 1234        |
| topic           | character(66)     | NOT NULL   | Bytes32 event topic | 0x000...000 |
| type            | character varying | NOT NULL   | Event type          | DataChanged |

### follow

This table stores follow information.

- Column `follower` references the `contract` table's `address` column.
- Column `following` references the `contract` table's `address` column.

| Column    | Data Type     | Constraint | Description       | Example       |
|-----------|---------------|------------|-------------------|---------------|
| follower  | character(42) | NOT NULL   | Follower address  | 0x0000...0000 |
| following | character(42) | NOT NULL   | Following address | 0x0000..0000  |

### image

This table stores metadata image information of a contract. Not every contract have images associated

- Column `address` references the `contract_metadata` table's `address` column.
- The `type` column have three possible values: `profile`, `background`, or `icon`

| Column  | Data Type         | Constraint | Description        | Example            |
|---------|-------------------|------------|--------------------|--------------------|
| address | character(42)     | NOT NULL   | Contract address   | 0x0000...0000      |
| url     | character varying | NOT NULL   | Image URL          | https://someurl.io |
| width   | smallint          | NOT NULL   | Image width        | 200                |
| height  | smallint          | NOT NULL   | Image height       | 200                |
| type    | character varying | NOT NULL   | Image type         | background         |
| hash    | character(66)     | NOT NULL   | Bytes32 image hash | 0xab2185...a12     |     

### key_display

This table stores custom displays sentences for [ERC725Y key/value store](https://github.com/ERC725Alliance/ERC725/blob/develop/implementations/contracts/ERC725YCore.sol) entries.
This is used in order to display `DataChanged` events in the feed on a user-friendly way.

- Column `key` references the `erc725y_schema` table's `key` column.

| Column              | Data Type         | Constraint | Description               | Example                                     |
|---------------------|-------------------|------------|---------------------------|---------------------------------------------|
| key                 | character(66)     | NOT NULL   | Key                       | 0x4b80742de2bf82acb3630000<address>         |
| display             | character varying | NOT NULL   | Key display               | Permissions of {address} set to {dataValue} |
| displayWithoutValue | character varying | NOT NULL   | Key display without value | Permissions set for {address}               |

### like

This table stores post likes.

- Column `postHash` references the `post` table's `hash` column.
- Column `sender` references the `contract` table's `address` column.

| Column   | Data Type     | Constraint | Description       | Example       |
|----------|---------------|------------|-------------------|---------------|
| sender   | character(42) | NOT NULL   | Sender address    | 0x0000...0000 |
| postHash | character(66) | NOT NULL   | Bytes32 post hash | 0x0000...0000 |

### link

This table stores links associated with contract metadata. Not all contracts have links.

- Column `address` references the `contract_metadata` table's `address` column.

| Column  | Data Type         | Constraint | Description      | Example                           |
|---------|-------------------|------------|------------------|-----------------------------------|
| address | character(42)     | NOT NULL   | Contract address | 0x0000...0000                     |
| title   | character varying | NOT NULL   | Link title       | Linkedin                          |
| url     | character varying | NOT NULL   | Link URL         | https://linkedin.com/superprofile |

### method_display

This table stores custom displays for method executions.
This is used in order to display the decoded data from `Executed` events in the feed on a user-friendly way.
These events are triggered by Universal Profiles, and more precisely by the [ERC725X contract](https://github.com/ERC725Alliance/ERC725/blob/develop/implementations/contracts/ERC725YCore.sol) entries.

Multiple parameters are available for the displays and can be used in the `text` field by surrounding their label by `{}`.
Those available parameters are the method parameters (it's the parameter name that need to be used below). 
Also, few additional parameters are available:
- `executionContract`: address of the contract where the method was executed
- `senderAddress`: address of the contract where the `Executed` event has been triggered (the UP that sent the transaction)
- `nativeToken`: unit of the native blockchain token (ETH on Ethereum, LYX on Lukso)

<br>

- Column `methodId` references the `method_interface` table's `id` column.

| Column       | Data Type         | Constraint | Description                                  | Example                   |
|--------------|-------------------|------------|----------------------------------------------|---------------------------|
| methodId     | character(10)     | NOT NULL   | Method ID                                    | 0x01c42bd7                |
| text         | character varying | NOT NULL   | Text that will be displayed on the user feed | Created {contractAddress} |
| imageFrom    | character varying |            | Image source for the method                  | contractAddress           |
| copiesFrom   | character varying |            | Method copies source                         |                           |
| standardFrom | character varying |            | Method standard source                       | contractAddress           |

### method_interface

This table stores known method and event interfaces. They are used in order to identify and decode raw transaction data. 
We use it for example to identify the method called in `Executed` events.

| Column | Data Type         | Constraint | Description                        | Example               |
|--------|-------------------|------------|------------------------------------|-----------------------|
| id     | character(10)     | NOT NULL   | First bytes4 of the interface hash | 0x4e71e0c8            |
| hash   | character(66)     | NOT NULL   | Bytes32 interface hash             | 0x4e71e0c8...b4a76b23 |
| name   | character varying | NOT NULL   | Interface name                     | claimOwnership        |
| type   | character varying | NOT NULL   | Method type (`method` or `event`)  | method                |

TODO: change `type` type to varchar(6) 

### method_parameter

This table stores parameters information from known event and method interfaces.
The `displayType` is optional, and if present, will override the `type`, which is used by our frontend to know how to handle the value in the feed.

- Column `methodId` references the `method_interface` table's `id` column.

| Column      | Data Type         | Constraint | Description                                                     | Example    |
|-------------|-------------------|------------|-----------------------------------------------------------------|------------|
| methodId    | character(10)     | NOT NULL   | Method ID                                                       | 0x6b934045 |
| name        | character varying | NOT NULL   | Parameter name                                                  | selector   |
| type        | character varying | NOT NULL   | Parameter type                                                  | bytes4     |
| indexed     | boolean           | NOT NULL   | Whether the parameter is indexed                                | false      |
| displayType | character varying |            | Parameter display type (if different from type)                 | methodId   |
| position    | integer           | NOT NULL   | Parameter position: order in the method definition. Starts by 0 | 1          |

### nonces

This table stores profiles nonce,in order to authenticate accounts.

TODO: change this table to `profile`, it will be used to store some profile configuration as well.
Change `userAddress` to `address`.

| Column      | Data Type     | Constraint | Description  | Example       |
|-------------|---------------|------------|--------------|---------------|
| userAddress | character(42) | NOT NULL   | User address | 0x0000...0000 |
| nonce       | character(8)  | NOT NULL   | Nonce value  | 12345678      |

### notification

This table stores profile notifications.

- Column `address` references the `contract` table's `address` column.
- Column `postHash` references the `post` table's `hash` column.
- Column `sender` references the `contract` table's `address` column.

| Column   | Data Type                | Constraint | Description                                                                | Example                    |
|----------|--------------------------|------------|----------------------------------------------------------------------------|----------------------------|
| address  | character(42)            | NOT NULL   | Address of the contract that will receive the notification                 | 0x0000...0000              |
| sender   | character(42)            | NOT NULL   | Address of the profile that triggered the notification (e.g. the follower) | 0x0000...0000              |
| date     | timestamp with time zone | NOT NULL   | Notification date                                                          | 2022-10-13 15:31:53.018+01 |
| viewed   | boolean                  | NOT NULL   | Whether the notification has been viewed                                   | true                       |
| type     | character varying        | NOT NULL   | Notification type (`like`, `follow`, `comment`, or `tag`)                  | like                       |
| postHash | character(66)            |            | Bytes32 post hash (if type is `like`, `comment` or `tag`)                  | 0x0000...0000              |

### post

This table stores posts (either user generated post, either post from event).

- Column `childHash` references the `post` table's `hash` column.
- Column `eventId` references the `event` table's `id` column.
- Column `parentHash` references the `post` table's `hash` column.
- Column `author` references the `contract` table's `address` column.

TODO: Add a column for the post url (optional)

| Column          | Data Type                | Constraint | Description                                                 | Example                    |
|-----------------|--------------------------|------------|-------------------------------------------------------------|----------------------------|
| hash            | character(66)            | NOT NULL   | Bytes32 post hash                                           | 0x0000...0000              |
| author          | character(42)            | NOT NULL   | Post author                                                 | 0x0000...0000              |
| date            | timestamp with time zone | NOT NULL   | Post date                                                   | 2022-10-13 15:31:53.018+01 |
| text            | character varying        | NOT NULL   | Post text                                                   | Some text                  |
| mediaUrl        | character varying        | NOT NULL   | Post media URL                                              | https://someurl.com        |
| parentHash      | character(66)            |            | Parent post hash                                            |                            |
| childHash       | character(66)            |            | Child post hash                                             |                            |
| eventId         | integer                  |            | Event ID                                                    |                            |
| inRegistry      | boolean                  |            | Whether the post is in the author registry                  | true                       |
| transactionHash | character(66)            |            | Transaction hash                                            | 0x0000...0000              |
| trusted         | boolean                  |            | Whether the post is trusted (known validator contract used) | true                       |

### registry_change

This table stores profile registry changes. It is used in order to track the off-chain registry changes the use has done, 
in order to later on, update the on-chain registry with the newest version.
Each time a profile registry has been updated with all those registry changes, all the registry_change associated with this profile are deleted.


| Column  | Data Type                | Constraint | Description                                                          | Example                    |
|---------|--------------------------|------------|----------------------------------------------------------------------|----------------------------|
| address | character(42)            | NOT NULL   | Profile address                                                      | 0x0000...0000              |
| type    | character varying        | NOT NULL   | Change type (`follow` or `like`)                                     | follow                     |
| action  | character varying        | NOT NULL   | Action taken (`remove` or `add`)                                     | add                        |
| value   | character varying        | NOT NULL   | Change value (profile address for `follow`, or post hash for `like`) | 0000...0000                |
| date    | timestamp with time zone | NOT NULL   | Change date                                                          | 2022-10-28 09:46:36.182+01 |

### tag

This table tags associated to contract metadata (generally universal profiles).
The tag is a keyword generally chosen to describe the contract.

- Column `address` references the `contract_metadata` table's `address` column.

| Column  | Data Type         | Constraint | Description      | Example       |
|---------|-------------------|------------|------------------|---------------|
| address | character(42)     | NOT NULL   | Contract address | 0x0000...0000 |
| title   | character varying | NOT NULL   | Tag title        | Music         |

### transaction

This table stores indexed transactions.

| Column      | Data Type         | Constraint | Description             | Example       |
|-------------|-------------------|------------|-------------------------|---------------|
| hash        | character(66)     | NOT NULL   | Transaction hash        | 0x0000...0000 |
| from        | character(42)     | NOT NULL   | Transaction sender      | 0x0000...0001 |
| to          | character(42)     |            | Transaction recipient   | 0x0000...0002 |
| value       | character varying | NOT NULL   | Transaction value (hex) | 0x00          |
| input       | character varying | NOT NULL   | Transaction (raw) input | 0x00          |
| blockNumber | integer           | NOT NULL   | Block number            | 123456        |
| methodId    | character(10)     | NOT NULL   | Method ID               | 0xa21b432a    |
