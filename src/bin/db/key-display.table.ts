import {executeQuery} from "./database";
import {KeyDisplay} from "../../models/types/key-display";

export async function queryKeyDisplay(key: string): Promise<KeyDisplay> {
  const res = await executeQuery('SELECT * FROM "key_display" WHERE LOWER(key) LIKE LOWER($1)', [`%${key.slice(0, 26)}%`]);
  if (res.rows.length > 0) return res.rows[0];
  else throw 'No display found for the key: ' + key;
}

export async function insertKeyDisplay(key: string, display: string, displayWithoutValue: string): Promise<void> {
  await executeQuery('INSERT INTO "key_display" VALUES ($1, $2, $3)', [key, display, displayWithoutValue]);
}