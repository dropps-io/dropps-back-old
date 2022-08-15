import {executeQuery} from "./database";

export async function queryKeyDisplay(key: string): Promise<string> {
  const res = await executeQuery('SELECT display FROM "key_display" WHERE "key" = $1', [key]);
  if (res.rows.length > 0) return res.rows[0].display;
  else return '';
}

export async function insertKeyDisplay(key: string, display: string): Promise<void> {
  await executeQuery('INSERT INTO "key_display" VALUES ($1, $2)', [key, display]);
}