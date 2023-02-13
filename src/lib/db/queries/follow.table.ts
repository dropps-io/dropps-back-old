import { executeQuery } from '../database';
import { ERROR_NOT_FOUND } from '../../utils/error-messages';

export async function queryFollow(follower: string, following: string): Promise<boolean> {
  const res = await executeQuery(
    'SELECT * FROM "follow" WHERE "follower" = $1 AND "following" = $2',
    [follower, following],
  );
  return res.rows.length > 0;
}

export async function queryFollowing(follower: string): Promise<string[]> {
  const res = await executeQuery('SELECT ("following") FROM "follow" WHERE "follower" = $1', [
    follower,
  ]);
  return res.rows.map((x: { following: string }) => x.following);
}

export async function queryFollowers(following: string): Promise<string[]> {
  const res = await executeQuery('SELECT ("follower") FROM "follow" WHERE "following" = $1', [
    following,
  ]);
  return res.rows.map((x: { follower: string }) => x.follower);
}

export async function queryFollowingWithNames(
  follower: string,
  limit: number,
  offset: number,
): Promise<{ address: string; name: string }[]> {
  const res = await executeQuery(
    'SELECT "address","name" FROM follow INNER JOIN contract_metadata ON follow.following=contract_metadata.address WHERE follower = $1 ORDER BY CASE name WHEN \'\' THEN 1 ELSE 0 END ASC, name ASC LIMIT $2 OFFSET $3;',
    [follower, limit, offset],
  );
  return res.rows;
}

export async function queryFollowersWithNames(
  following: string,
  limit: number,
  offset: number,
): Promise<{ address: string; name: string }[]> {
  const res = await executeQuery(
    'SELECT "address","name" FROM follow INNER JOIN contract_metadata ON follow.follower=contract_metadata.address WHERE following = $1 ORDER BY CASE name WHEN \'\' THEN 1 ELSE 0 END ASC, name ASC LIMIT $2 OFFSET $3;',
    [following, limit, offset],
  );
  return res.rows;
}

export async function queryFollowersCount(following: string): Promise<number> {
  const res = await executeQuery('SELECT COUNT(*) FROM "follow" WHERE "following" = $1', [
    following,
  ]);
  return parseInt(res.rows[0].count);
}

export async function queryFollowingCount(follower: string): Promise<number> {
  const res = await executeQuery('SELECT COUNT(*) FROM "follow" WHERE "follower" = $1', [follower]);
  return parseInt(res.rows[0].count);
}

export async function insertFollow(follower: string, following: string): Promise<void> {
  await executeQuery('INSERT INTO "follow" VALUES ($1, $2)', [follower, following]);
}

export async function removeFollow(follower: string, following: string): Promise<void> {
  const res = await executeQuery(
    'DELETE FROM "follow" WHERE "follower" = $1 AND "following" = $2',
    [follower, following],
  );
  if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}
