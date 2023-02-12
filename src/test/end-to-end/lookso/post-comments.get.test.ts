import { describe } from 'mocha';
import { expect } from 'chai';
import { LightMyRequestResponse } from 'fastify';

import { clearDB } from '../../helpers/database-helper';
import { insertContractInterface } from '../../../lib/db/queries/contract-interface.table';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { insertPost } from '../../../lib/db/queries/post.table';
import { fastify } from '../../../api/fastify';
import { insertLike } from '../../../lib/db/queries/like.table';
import { FeedPost } from '../../../models/types/feed-post';
import {
  HACKER_MAN_UP,
  POST_HASH,
  POST_HASH2,
  POST_HASH3,
  POST_HASH4,
  POST_HASH5,
  SERIOUS_MAN_UP,
  UNIVERSAL_PROFILE_1,
  UNIVERSAL_PROFILE_2,
} from '../../helpers/constants';
import { API_URL, COMMENTS_PER_LOAD } from '../../../environment/config';
import { generateRandomKeccakHash } from '../../helpers/generate-mocks';

export const PostCommentsGETTests = () => {
  describe('GET lookso/post/:hash/comments', () => {
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
      await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
      await insertContract(UNIVERSAL_PROFILE_2, 'LSP0');
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
      await insertPost(
        POST_HASH2,
        HACKER_MAN_UP,
        new Date('2022-09-27T12:03:32.089Z'),
        'test1',
        '',
        POST_HASH,
        null,
        null,
      );
      await insertPost(
        POST_HASH3,
        SERIOUS_MAN_UP,
        new Date('2022-09-27T12:03:33.089Z'),
        'test1',
        '',
        POST_HASH,
        null,
        null,
      );
      await insertPost(
        POST_HASH4,
        UNIVERSAL_PROFILE_1,
        new Date('2022-09-27T12:03:34.089Z'),
        'test1',
        '',
        POST_HASH,
        null,
        null,
      );
      await insertPost(
        POST_HASH5,
        UNIVERSAL_PROFILE_2,
        new Date('2022-09-27T12:03:35.089Z'),
        'test1',
        '',
        POST_HASH,
        null,
        null,
      );
      await insertLike(HACKER_MAN_UP, POST_HASH2);
      await insertLike(HACKER_MAN_UP, POST_HASH4);
      res = await fastify.inject({ method: 'GET', url: `/lookso/post/${POST_HASH}/comments` });
      payload = JSON.parse(res.payload);
    });

    it('should return 200', async () => {
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right amount of comments', async () => {
      expect(payload.results.length).to.equal(4);
    });

    it('should return posts in chronological order', async () => {
      expect(payload.results[3].hash).to.equal(POST_HASH5);
      expect(payload.results[2].hash).to.equal(POST_HASH4);
      expect(payload.results[1].hash).to.equal(POST_HASH3);
      expect(payload.results[0].hash).to.equal(POST_HASH2);
    });

    it('should show if a post is liked or not if viewOf', async () => {
      res = await fastify.inject({
        method: 'GET',
        url: `/lookso/post/${POST_HASH}/comments?viewOf=${HACKER_MAN_UP}`,
      });
      payload = JSON.parse(res.payload);
      expect(payload.results.filter((p) => p.hash === POST_HASH2)[0].isLiked).to.equal(true);
      expect(payload.results.filter((p) => p.hash === POST_HASH3)[0].isLiked).to.equal(false);
      expect(payload.results.filter((p) => p.hash === POST_HASH4)[0].isLiked).to.equal(true);
      expect(payload.results.filter((p) => p.hash === POST_HASH5)[0].isLiked).to.equal(false);
    });

    it('should return 400 if invalid hash', async () => {
      res = await fastify.inject({ method: 'GET', url: `/lookso/post/${POST_HASH}a/comments` });
      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if invalid viewOf', async () => {
      res = await fastify.inject({
        method: 'GET',
        url: `/lookso/post/${POST_HASH}/comments?viewOf=${HACKER_MAN_UP}q`,
      });
      expect(res.statusCode).to.equal(400);
    });

    describe('With pagination', () => {
      beforeEach(async () => {
        for (let i = 0; i < COMMENTS_PER_LOAD * 2 - 4; i++) {
          await insertPost(
            generateRandomKeccakHash(),
            SERIOUS_MAN_UP,
            new Date('2022-09-27T12:03:32.089Z'),
            'test1',
            '',
            POST_HASH,
            null,
            null,
          );
        }
      });

      it('should return the previous page when not in the query', async () => {
        res = await fastify.inject({ method: 'GET', url: `/lookso/post/${POST_HASH}/comments` });
        payload = JSON.parse(res.payload);
        expect(payload.next).to.be.null;
        expect(payload.previous).to.equal(`${API_URL}/lookso/post/${POST_HASH}/comments?page=0`);
      });

      it('should return the right amount of posts', async () => {
        res = await fastify.inject({ method: 'GET', url: `/lookso/post/${POST_HASH}/comments` });
        payload = JSON.parse(res.payload);
        expect(payload.results.length).to.be.equal(COMMENTS_PER_LOAD);
      });

      it('should return the next page', async () => {
        res = await fastify.inject({
          method: 'GET',
          url: `/lookso/post/${POST_HASH}/comments?page=0`,
        });
        payload = JSON.parse(res.payload);
        expect(payload.previous).to.be.null;
        expect(payload.next).to.equal(`${API_URL}/lookso/post/${POST_HASH}/comments?page=1`);
      });

      it('should return the next page with query params', async () => {
        res = await fastify.inject({
          method: 'GET',
          url: `/lookso/post/${POST_HASH}/comments?viewOf=${SERIOUS_MAN_UP}&page=0`,
        });
        payload = JSON.parse(res.payload);
        expect(payload.previous).to.be.null;
        expect(payload.next).to.equal(
          `${API_URL}/lookso/post/${POST_HASH}/comments?viewOf=${SERIOUS_MAN_UP}&page=1`,
        );
      });

      it('should return the previous page with query params', async () => {
        res = await fastify.inject({
          method: 'GET',
          url: `/lookso/post/${POST_HASH}/comments?viewOf=${SERIOUS_MAN_UP}`,
        });
        payload = JSON.parse(res.payload);
        expect(payload.next).to.be.null;
        expect(payload.previous).to.equal(
          `${API_URL}/lookso/post/${POST_HASH}/comments?viewOf=${SERIOUS_MAN_UP}&page=0`,
        );
      });

      it('should return only one post on the last page if 61 posts in the feed', async () => {
        await insertPost(
          generateRandomKeccakHash(),
          SERIOUS_MAN_UP,
          new Date('2022-09-27T12:03:32.089Z'),
          'test1',
          '',
          POST_HASH,
          null,
          null,
        );
        res = await fastify.inject({ method: 'GET', url: `/lookso/post/${POST_HASH}/comments` });
        payload = JSON.parse(res.payload);
        expect(payload.next).to.be.null;
        expect(payload.previous).to.equal(`${API_URL}/lookso/post/${POST_HASH}/comments?page=1`);
        expect(payload.count).to.equal(COMMENTS_PER_LOAD * 2 + 1);
        expect(payload.results.length).to.equal(1);
      });
    });
  });
};
