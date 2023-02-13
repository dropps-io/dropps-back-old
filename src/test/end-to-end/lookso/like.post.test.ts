import { clearDB } from '../../helpers/database-helper';
import { insertContractInterface } from '../../../lib/db/queries/contract-interface.table';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { insertPost } from '../../../lib/db/queries/post.table';
import { fastify } from '../../../api/fastify';
import { MAX_OFFCHAIN_REGISTRY_CHANGES } from '../../../environment/config';
import { executeQuery } from '../../../lib/db/database';
import { queryPostLike } from '../../../lib/db/queries/like.table';
import { queryNotificationsOfAddress } from '../../../lib/db/queries/notification.table';
import { queryRegistryChangesOfAddress } from '../../../lib/db/queries/registry-change.table';
import {
  HACKER_MAN_JWT,
  HACKER_MAN_UP,
  POST_HASH,
  POST_HASH2,
  SERIOUS_MAN_JWT,
  SERIOUS_MAN_UP,
} from '../../helpers/constants';

describe('POST lookso/like', () => {
  beforeEach(async () => {
    await clearDB();
    await insertContractInterface('LSP0', '0xid', 'Universal Profile');
    await insertContract(HACKER_MAN_UP, 'LSP0');
    await insertContract(SERIOUS_MAN_UP, 'LSP0');
    await insertPost(POST_HASH, HACKER_MAN_UP, new Date(), '', '', null, null, null);
  });

  it('should return 400 if incorrect address', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: HACKER_MAN_UP + 'c',
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + HACKER_MAN_JWT,
      },
    });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 404 if post doesn't exist", async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: HACKER_MAN_UP,
        postHash: POST_HASH2,
      },
      headers: {
        authorization: 'Bearer ' + HACKER_MAN_JWT,
      },
    });

    expect(res.statusCode).toEqual(404);
  });

  it('should return 403 if wrong JWT', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: HACKER_MAN_UP,
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + SERIOUS_MAN_JWT,
      },
    });

    expect(res.statusCode).toEqual(403);
  });

  it('should return 409 if changes count exceed limit', async () => {
    let query =
      'INSERT INTO "registry_change" VALUES (\'' +
      HACKER_MAN_UP +
      "', 'follow', '" +
      Math.random().toString() +
      "', '', '" +
      new Date().toDateString() +
      "')";
    for (let i = 0; i < MAX_OFFCHAIN_REGISTRY_CHANGES - 1; i++)
      query +=
        ", ('" +
        HACKER_MAN_UP +
        "', 'follow', '" +
        Math.random().toString() +
        "', '', '" +
        new Date().toDateString() +
        "')";
    await executeQuery(query);

    const res = await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: HACKER_MAN_UP,
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + HACKER_MAN_JWT,
      },
    });

    expect(res.statusCode).toEqual(409);
  });

  it('should return registry json url if reach limit of changes', async () => {
    let query =
      'INSERT INTO "registry_change" VALUES (\'' +
      HACKER_MAN_UP +
      "', 'follow', '" +
      Math.random().toString() +
      "', '', '" +
      new Date().toDateString() +
      "')";
    for (let i = 0; i < MAX_OFFCHAIN_REGISTRY_CHANGES - 2; i++)
      query +=
        ", ('" +
        HACKER_MAN_UP +
        "', 'follow', '" +
        Math.random().toString() +
        "', '', '" +
        new Date().toDateString() +
        "')";
    await executeQuery(query);

    const res = await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: HACKER_MAN_UP,
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + HACKER_MAN_JWT,
      },
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeDefined();
  });

  it('should return 200 if correct request', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: HACKER_MAN_UP,
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + HACKER_MAN_JWT,
      },
    });

    expect(res.statusCode).toEqual(200);
  });

  it('should properly update the database', async () => {
    await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: HACKER_MAN_UP,
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + HACKER_MAN_JWT,
      },
    });

    const res = await queryPostLike(HACKER_MAN_UP, POST_HASH);

    expect(res).toEqual(true);
  });

  it('should properly create a notification on like', async () => {
    await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: SERIOUS_MAN_UP,
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + SERIOUS_MAN_JWT,
      },
    });

    const res = await queryNotificationsOfAddress(HACKER_MAN_UP, 1, 0);

    expect(res[0].postHash).toEqual(POST_HASH);
    expect(res[0].sender).toEqual(SERIOUS_MAN_UP);
    expect(res[0].address).toEqual(HACKER_MAN_UP);
    expect(res[0].viewed).toEqual(false);
    expect(res[0].type).toEqual('like');
  });

  it('should properly create a registry change entry on like', async () => {
    await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: SERIOUS_MAN_UP,
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + SERIOUS_MAN_JWT,
      },
    });

    const res = await queryRegistryChangesOfAddress(SERIOUS_MAN_UP);

    expect(res[0].address).toEqual(SERIOUS_MAN_UP);
    expect(res[0].type).toEqual('like');
    expect(res[0].action).toEqual('add');
    expect(res[0].value).toEqual(POST_HASH);
  });

  it('should return 200 for unlike', async () => {
    await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: HACKER_MAN_UP,
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + HACKER_MAN_JWT,
      },
    });

    const res = await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: HACKER_MAN_UP,
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + HACKER_MAN_JWT,
      },
    });

    expect(res.statusCode).toEqual(200);
  });

  it('should properly update the database for unlike', async () => {
    await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: HACKER_MAN_UP,
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + HACKER_MAN_JWT,
      },
    });

    await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: HACKER_MAN_UP,
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + HACKER_MAN_JWT,
      },
    });

    const res = await queryPostLike(HACKER_MAN_UP, POST_HASH);

    expect(res).toEqual(false);
  });

  it('should properly create a registry change entry on unlike', async () => {
    await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: SERIOUS_MAN_UP,
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + SERIOUS_MAN_JWT,
      },
    });

    await executeQuery('DELETE FROM "registry_change"');

    await fastify.inject({
      method: 'POST',
      url: '/lookso/like',
      payload: {
        sender: SERIOUS_MAN_UP,
        postHash: POST_HASH,
      },
      headers: {
        authorization: 'Bearer ' + SERIOUS_MAN_JWT,
      },
    });

    const res = await queryRegistryChangesOfAddress(SERIOUS_MAN_UP);

    expect(res[0].address).toEqual(SERIOUS_MAN_UP);
    expect(res[0].type).toEqual('like');
    expect(res[0].action).toEqual('remove');
    expect(res[0].value).toEqual(POST_HASH);
  });
});
