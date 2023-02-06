import { Post } from '../../../models/types/post';
import { executeQuery } from './database';

export async function queryPost(hash: string): Promise<Post> {
  const res = await executeQuery('SELECT * FROM "post" WHERE "hash" = $1', [hash]);
  if (res.rows.length > 0) return res.rows[0] as Post;
  else throw 'No post found';
}

export async function queryPostCommentsCount(hash: string): Promise<number> {
  const res = await executeQuery(
    'SELECT COUNT(*) FROM "post" WHERE "parentHash" = $1 AND ("trusted" IS NULL OR "trusted"=true)',
    [hash],
  );
  return parseInt(res.rows[0].count);
}

export async function queryPostRepostsCount(hash: string): Promise<number> {
  const res = await executeQuery(
    'SELECT COUNT(*) FROM "post" WHERE "childHash" = $1 AND ("trusted" IS NULL OR "trusted"=true)',
    [hash],
  );
  return parseInt(res.rows[0].count);
}

export async function queryPosts(
  limit: number,
  offset: number,
  type?: 'event' | 'post',
): Promise<Post[]> {
  let query =
    'SELECT * FROM "post" INNER JOIN "contract" ON post.author=contract.address WHERE "interfaceCode" = \'LSP0\' AND "parentHash" IS NULL AND ("trusted" IS NULL OR "trusted"=true)';
  if (type) query += type === 'event' ? ' AND "eventId" IS NOT NULL' : ' AND "eventId" IS NULL';
  query += ' ORDER BY "date", "author", "hash" LIMIT $1 OFFSET $2';
  const res = await executeQuery(query, [limit, offset]);
  return res.rows as Post[];
}

export async function queryPostsCount(type?: 'event' | 'post'): Promise<number> {
  let query =
    'SELECT COUNT(*) FROM "post" INNER JOIN "contract" ON post.author=contract.address WHERE "interfaceCode" = \'LSP0\' AND "parentHash" IS NULL AND ("trusted" IS NULL OR "trusted"=true)';
  if (type) query += type === 'event' ? ' AND "eventId" IS NOT NULL' : ' AND "eventId" IS NULL';
  const res = await executeQuery(query);
  if (res.rows[0]) return res.rows[0].count as number;
  else throw Error('Unable to fetch');
}

export async function queryPostComments(
  hash: string,
  limit: number,
  offset: number,
): Promise<Post[]> {
  const query =
    'SELECT * FROM "post" WHERE "parentHash" = $1  AND ("trusted" IS NULL OR "trusted"=true) ORDER BY "date", "author", "hash" LIMIT $2 OFFSET $3';
  const res = await executeQuery(query, [hash, limit, offset]);
  return res.rows as Post[];
}

export async function queryPostsOfUserCount(
  address: string,
  type?: 'event' | 'post',
): Promise<number> {
  let query =
    'SELECT COUNT(*) FROM "post" WHERE "author" = $1 AND "parentHash" IS NULL AND ("trusted" IS NULL OR "trusted"=true)';
  if (type) query += type === 'event' ? ' AND "eventId" IS NOT NULL' : ' AND "eventId" IS NULL ';
  const res = await executeQuery(query, [address]);
  if (res.rows[0]) return res.rows[0].count as number;
  else throw Error('Unable to fetch');
}

export async function queryPostsOfUser(
  address: string,
  limit: number,
  offset: number,
  type?: 'event' | 'post',
): Promise<Post[]> {
  let query =
    'SELECT * FROM "post" WHERE "author" = $1 AND "parentHash" IS NULL AND ("trusted" IS NULL OR "trusted"=true)';
  if (type) query += type === 'event' ? ' AND "eventId" IS NOT NULL' : ' AND "eventId" IS NULL';
  query += ' ORDER BY "date", "author", "hash" LIMIT $2 OFFSET $3';
  const res = await executeQuery(query, [address, limit, offset]);
  return res.rows as Post[];
}

export async function queryPostHashesOfUser(
  address: string,
  limit: number,
  offset: number,
  type?: 'event' | 'post',
): Promise<string[]> {
  let query = 'SELECT hash FROM "post" WHERE "author" = $1 AND "parentHash" IS NULL';
  if (type) query += type === 'event' ? ' AND "eventId" IS NOT NULL' : ' AND "eventId" IS NULL';
  query += ' ORDER BY "date" DESC LIMIT $2 OFFSET $3';
  const res = await executeQuery(query, [address, limit, offset]);
  return res.rows.map((p: { hash: string }) => p.hash);
}

export async function queryPostsOfUsersCount(
  addresses: string[],
  type?: 'event' | 'post',
): Promise<number> {
  const params = addresses.map((a, i) => '$' + (i + 1).toString());
  let query =
    'SELECT COUNT(*) FROM "post" WHERE "parentHash" IS NULL AND "author" IN (' +
    params.join(',') +
    ') AND ("trusted" IS NULL OR "trusted"=true)';
  if (type) query += type === 'event' ? ' AND "eventId" IS NOT NULL' : ' AND "eventId" IS NULL';
  const res = await executeQuery(query, [...addresses]);
  if (res.rows[0]) return res.rows[0].count as number;
  else throw Error('Unable to fetch');
}

export async function queryPostsOfUsers(
  addresses: string[],
  limit: number,
  offset: number,
  type?: 'event' | 'post',
): Promise<Post[]> {
  const params = addresses.map((a, i) => '$' + (i + 3).toString());
  let query =
    'SELECT * FROM "post" WHERE "parentHash" IS NULL AND "author" IN (' +
    params.join(',') +
    ') AND ("trusted" IS NULL OR "trusted"=true)';
  if (type) query += type === 'event' ? ' AND "eventId" IS NOT NULL' : ' AND "eventId" IS NULL';
  query += ' ORDER BY "date", "author", "hash" LIMIT $1 OFFSET $2';
  const res = await executeQuery(query, [limit, offset, ...addresses]);
  return res.rows as Post[];
}

//TODO Add to table mediaType to know how to display or not a media
export async function insertPost(
  hash: string,
  author: string,
  date: Date,
  text: string,
  mediaUrl: string,
  parentHash: string | null,
  childHash: string | null,
  eventId: number | null,
  inRegistry?: boolean,
  txHash?: string,
  trusted?: boolean,
): Promise<Post> {
  const res = await executeQuery(
    'INSERT INTO "post" VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
    [
      hash,
      author,
      date,
      text,
      mediaUrl,
      parentHash,
      childHash,
      eventId,
      inRegistry,
      txHash,
      trusted,
    ],
  );
  return res.rows[0] as Post;
}
