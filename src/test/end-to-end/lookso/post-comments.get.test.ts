import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {insertContractInterface} from "../../../bin/db/contract-interface.table";
import {insertContract} from "../../../bin/db/contract.table";
import {insertPost} from "../../../bin/db/post.table";
import {fastify} from "../../../lib/fastify";
import {expect} from "chai";
import {insertLike} from "../../../bin/db/like.table";
import {LightMyRequestResponse} from "fastify";
import {FeedPost} from "../../../models/types/feed-post";
import {
  HACKER_MAN_UP, POST_HASH, POST_HASH2, POST_HASH3, POST_HASH4, POST_HASH5, SERIOUS_MAN_UP, UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2
} from "../../helpers/constants";

export const PostCommentsGETTests = () => {

  describe('GET lookso/post/:hash/comments', () => {

    let res: LightMyRequestResponse;
    let feed: FeedPost[];

    beforeEach(async () => {
      await clearDB();
      await insertContractInterface('LSP0', '0xid', 'Universal Profile');
      await insertContract(HACKER_MAN_UP, 'LSP0');
      await insertContract(SERIOUS_MAN_UP, 'LSP0');
      await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
      await insertContract(UNIVERSAL_PROFILE_2, 'LSP0');
      await insertPost(POST_HASH, HACKER_MAN_UP, new Date('2022-09-27T12:03:31.089Z'), 'test', '', null, null, null);
      await insertPost(POST_HASH2, HACKER_MAN_UP, new Date('2022-09-27T12:03:32.089Z'), 'test1', '', POST_HASH, null, null);
      await insertPost(POST_HASH3, SERIOUS_MAN_UP, new Date('2022-09-27T12:03:33.089Z'), 'test1', '', POST_HASH, null, null);
      await insertPost(POST_HASH4, UNIVERSAL_PROFILE_1, new Date('2022-09-27T12:03:34.089Z'), 'test1', '', POST_HASH, null, null);
      await insertPost(POST_HASH5, UNIVERSAL_PROFILE_2, new Date('2022-09-27T12:03:35.089Z'), 'test1', '', POST_HASH, null, null);
      await insertLike(HACKER_MAN_UP, POST_HASH2);
      await insertLike(HACKER_MAN_UP, POST_HASH4);
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/comments`});
      feed = JSON.parse(res.payload);
    });

    it('should return 200', async () => {
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right amount of comments', async () => {
      expect(feed.length).to.equal(4);
    });

    it('should return posts in chronological order', async () => {
      expect(feed[0].hash).to.equal(POST_HASH5);
      expect(feed[1].hash).to.equal(POST_HASH4);
      expect(feed[2].hash).to.equal(POST_HASH3);
      expect(feed[3].hash).to.equal(POST_HASH2);
    });

    it('should show if a post is liked or not if viewOf', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/comments?viewOf=${HACKER_MAN_UP}`});
      feed = JSON.parse(res.payload);
      expect(feed.filter(p => p.hash === POST_HASH2)[0].isLiked).to.equal(true);
      expect(feed.filter(p => p.hash === POST_HASH3)[0].isLiked).to.equal(false);
      expect(feed.filter(p => p.hash === POST_HASH4)[0].isLiked).to.equal(true);
      expect(feed.filter(p => p.hash === POST_HASH5)[0].isLiked).to.equal(false);
    });

    it('should work with limit', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/comments?limit=1`});
      feed = JSON.parse(res.payload);
      expect(feed.length).to.equal(1);
    });

    it('should work with offset', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/comments?offset=1`});
      feed = JSON.parse(res.payload);
      expect(feed.length).to.equal(3);
    });

    it('should return 400 if invalid hash', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}a/comments`});
      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if invalid viewOf', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/comments?viewOf=${HACKER_MAN_UP}q`});
      expect(res.statusCode).to.equal(400);
    });
  });
}