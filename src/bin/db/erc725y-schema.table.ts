import {executeQuery} from "./database";
import {ERC725JSONSchema} from "@erc725/erc725.js";

export async function queryErc725ySchema(key: string): Promise<ERC725JSONSchema> {
  const res = await executeQuery('SELECT * FROM "erc725y_schema" WHERE "key" = $1', [key]);
  if (res.rows.length > 0) return res.rows[0];
  else throw 'No schema found for the key: ' + key;
}

export async function insertErc725ySchema(key: string, name: string, keyType: string, valueType: string, valueContent: string): Promise<void> {
  await executeQuery('INSERT INTO "erc725y_schema" VALUES ($1, $2, $3, $4, $5)', [key, name, keyType, valueType, valueContent]);
}