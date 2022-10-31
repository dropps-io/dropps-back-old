import {executeQuery} from "./database";
import {Erc725ySchema} from "../../models/types/erc725y-schema";

export async function queryErc725ySchema(key: string): Promise<Erc725ySchema> {
  const res = await executeQuery('SELECT * FROM "erc725y_schema" WHERE LOWER(key) LIKE LOWER($1)', [`%${key.slice(0, 26)}%`]);
  if (res.rows.length > 0) return res.rows[0];
  else throw 'No schema found for the key: ' + key;
}

export async function insertErc725ySchema(key: string, name: string, keyType: string, valueType: string, valueContent: string): Promise<void> {
  await executeQuery('INSERT INTO "erc725y_schema" VALUES ($1, $2, $3, $4, $5)', [key, name, keyType, valueType, valueContent]);
}