import { LightMyRequestResponse } from 'fastify';

import { clearDB } from '../../helpers/database-helper';
import { insertContractInterface } from '../../../lib/db/queries/contract-interface.table';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { insertPost } from '../../../lib/db/queries/post.table';
import { fastify } from '../../../api/fastify';
import { insertLike } from '../../../lib/db/queries/like.table';
import { FeedPost } from '../../../models/types/feed-post';
import { insertEvent } from '../../../lib/db/queries/event.table';
import { insertTransaction } from '../../../lib/db/queries/transaction.table';
import {
  HACKER_MAN_UP,
  POST_HASH,
  POST_HASH2,
  POST_HASH3,
  SERIOUS_MAN_UP,
} from '../../helpers/constants';
import { generateRandomKeccakHash } from '../../helpers/generate-mocks';
import { API_URL, POSTS_PER_LOAD } from '../../../environment/config';

describe('GET lookso/feed', () => {
  let res: LightMyRequestResponse;
  let payload: {
    count: number;
    next: string | null;
    previous: string | null;
    results: FeedPost[];
  };

  beforeEach(async () => {
    await clearDB();
    await insertContractInterface('LSP0', '0xid', 'Universal Profile');
    await insertContract(HACKER_MAN_UP, 'LSP0');
    await insertContract(SERIOUS_MAN_UP, 'LSP0');
    await insertPost(
      POST_HASH2,
      SERIOUS_MAN_UP,
      new Date('2022-09-27T12:03:32.089Z'),
      'test1',
      '',
      null,
      null,
      null,
    );
    await insertPost(
      POST_HASH,
      HACKER_MAN_UP,
      new Date('2022-09-27T12:03:31.089Z'),
      'test',
      '',
      null,
      null,
      null,
    );
    await insertLike(HACKER_MAN_UP, POST_HASH2);
    res = await fastify.inject({ method: 'GET', url: `/lookso/feed?viewOf=${HACKER_MAN_UP}` });
    payload = JSON.parse(res.payload);
  });

  it('should return 200', async () => {
    expect(res.statusCode).toEqual(200);
  });

  it('should return 2 feed posts', async () => {
    expect(payload.results.length).toEqual(2);
  });

  it('should return posts in chronological order', async () => {
    expect(payload.results[0].hash).toEqual(POST_HASH);
    expect(payload.results[1].hash).toEqual(POST_HASH2);
  });

  it('should show if a post is liked or not', async () => {
    expect(payload.results.filter((p) => p.hash === POST_HASH)[0].isLiked).toEqual(false);
    expect(payload.results.filter((p) => p.hash === POST_HASH2)[0].isLiked).toEqual(true);
  });

  it('should work with post filter', async () => {
    await insertTransaction(POST_HASH, SERIOUS_MAN_UP, HACKER_MAN_UP, '', '', 0);
    const id = await insertEvent(SERIOUS_MAN_UP, POST_HASH, '', 0, '', '');
    await insertPost(
      POST_HASH3,
      SERIOUS_MAN_UP,
      new Date('2022-09-27T12:03:33.089Z'),
      'test1',
      '',
      null,
      null,
      id,
    );
    res = await fastify.inject({ method: 'GET', url: `/lookso/feed?postType=post` });
    payload = JSON.parse(res.payload);
    expect(payload.results.length).toEqual(2);
    expect(payload.results.every((p) => p.type === 'post')).toBe(true);
  });

  it('should work with event filter', async () => {
    await insertTransaction(POST_HASH, SERIOUS_MAN_UP, HACKER_MAN_UP, '', '', 0);
    const id = await insertEvent(SERIOUS_MAN_UP, POST_HASH, '', 0, '', '');
    await insertPost(
      POST_HASH3,
      SERIOUS_MAN_UP,
      new Date('2022-09-27T12:03:33.089Z'),
      'test1',
      '',
      null,
      null,
      id,
    );
    res = await fastify.inject({ method: 'GET', url: `/lookso/feed?postType=event` });
    payload = JSON.parse(res.payload);
    expect(payload.results.length).toEqual(1);
    expect(payload.results.every((p) => p.type === 'event')).toBe(true);
  });

  describe('With pagination', () => {
    beforeEach(async () => {
      for (let i = 0; i < POSTS_PER_LOAD * 2 - 2; i++) {
        await insertPost(
          generateRandomKeccakHash(),
          SERIOUS_MAN_UP,
          new Date('2022-09-27T12:03:32.089Z'),
          'test1',
          '',
          null,
          null,
          null,
        );
      }
    });

    it('should return the previous page when not in the query', async () => {
      res = await fastify.inject({ method: 'GET', url: `/lookso/feed` });
      payload = JSON.parse(res.payload);
      expect(payload.next).toBeNull();
      expect(payload.previous).toEqual(API_URL + '/lookso/feed?page=0');
    });

    it('should return the right amount of posts', async () => {
      res = await fastify.inject({ method: 'GET', url: `/lookso/feed` });
      payload = JSON.parse(res.payload);
      expect(payload.results.length).toEqual(POSTS_PER_LOAD);
    });

    it('should return the next page', async () => {
      res = await fastify.inject({ method: 'GET', url: `/lookso/feed?page=0` });
      payload = JSON.parse(res.payload);
      expect(payload.previous).toBeNull();
      expect(payload.next).toEqual(API_URL + '/lookso/feed?page=1');
    });

    it('should return the next page with query params', async () => {
      res = await fastify.inject({
        method: 'GET',
        url: `/lookso/feed?viewOf=${SERIOUS_MAN_UP}&postType=post&page=0`,
      });
      payload = JSON.parse(res.payload);
      expect(payload.previous).toBeNull();
      expect(payload.next).toEqual(
        `${API_URL}/lookso/feed?postType=post&viewOf=${SERIOUS_MAN_UP}&page=1`,
      );
    });

    it('should return the previous page with query params', async () => {
      res = await fastify.inject({
        method: 'GET',
        url: `/lookso/feed?viewOf=${SERIOUS_MAN_UP}&postType=post`,
      });
      payload = JSON.parse(res.payload);
      expect(payload.next).toBeNull();
      expect(payload.previous).toEqual(
        `${API_URL}/lookso/feed?postType=post&viewOf=${SERIOUS_MAN_UP}&page=0`,
      );
    });

    it('should return only one post on the last page if 61 posts in the feed', async () => {
      await insertPost(
        generateRandomKeccakHash(),
        SERIOUS_MAN_UP,
        new Date('2022-09-27T12:03:32.089Z'),
        'test1',
        '',
        null,
        null,
        null,
      );
      res = await fastify.inject({ method: 'GET', url: `/lookso/feed` });
      payload = JSON.parse(res.payload);
      expect(payload.next).toBeNull();
      expect(payload.previous).toEqual(API_URL + '/lookso/feed?page=1');
      expect(payload.count).toEqual((POSTS_PER_LOAD * 2 + 1).toString());
      expect(payload.results.length).toEqual(1);
    });
  });
});
