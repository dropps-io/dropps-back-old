import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {insertContractInterface} from "../../../bin/db/contract-interface.table";
import {insertContract} from "../../../bin/db/contract.table";
import {insertPost} from "../../../bin/db/post.table";
import {fastify} from "../../../lib/fastify";
import {assert, expect} from "chai";
import {insertLike} from "../../../bin/db/like.table";
import {LightMyRequestResponse} from "fastify";
import {FeedPost} from "../../../models/types/feed-post";
import {insertEvent} from "../../../bin/db/event.table";
import {insertTransaction} from "../../../bin/db/transaction.table";
import {
  HACKER_MAN_UP, POST_HASH, POST_HASH2, POST_HASH3, POST_HASH4, POST_HASH5, POST_HASH6, SERIOUS_MAN_UP, UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2
} from "../../helpers/constants";
import {insertFollow} from "../../../bin/db/follow.table";

export const ProfileFeedGETTests = () => {

  describe('GET lookso/profile/:address/feed', () => {

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
      await insertPost(POST_HASH2, HACKER_MAN_UP, new Date('2022-09-27T12:03:32.089Z'), 'test1', '', null, null, null);
      await insertPost(POST_HASH3, SERIOUS_MAN_UP, new Date('2022-09-27T12:03:33.089Z'), 'test1', '', null, null, null);
      await insertPost(POST_HASH4, UNIVERSAL_PROFILE_1, new Date('2022-09-27T12:03:34.089Z'), 'test1', '', null, null, null);
      await insertPost(POST_HASH5, UNIVERSAL_PROFILE_2, new Date('2022-09-27T12:03:35.089Z'), 'test1', '', null, null, null);
      await insertLike(HACKER_MAN_UP, POST_HASH2);
      await insertLike(HACKER_MAN_UP, POST_HASH4);
      await insertFollow(HACKER_MAN_UP, SERIOUS_MAN_UP);
      await insertFollow(HACKER_MAN_UP, UNIVERSAL_PROFILE_1);
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/feed`});
      feed = JSON.parse(res.payload);
    });

    it('should return 200', async () => {
      expect(res.statusCode).to.equal(200);
    });

    it('should return 2 feed posts', async () => {
      expect(feed.length).to.equal(2);
    });

    it('should return posts in chronological order', async () => {
      expect(feed[0].hash).to.equal(POST_HASH4);
      expect(feed[1].hash).to.equal(POST_HASH3);
    });

    it('should show if a post is liked or not', async () => {
      expect(feed.filter(p => p.hash === POST_HASH3)[0].isLiked).to.equal(false);
      expect(feed.filter(p => p.hash === POST_HASH4)[0].isLiked).to.equal(true);
    });

    it('should work with limit', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/feed?limit=1`});
      feed = JSON.parse(res.payload);
      expect(feed.length).to.equal(1);
    });

    it('should work with offset', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/feed?offset=1`});
      feed = JSON.parse(res.payload);
      expect(feed.length).to.equal(1);
    });

    it('should work with post filter', async () => {
      await insertTransaction(POST_HASH, UNIVERSAL_PROFILE_1, SERIOUS_MAN_UP, '', '', 0);
      const id = await insertEvent(UNIVERSAL_PROFILE_1, POST_HASH, '', 0, '', '');
      await insertPost(POST_HASH6, UNIVERSAL_PROFILE_1, new Date('2022-09-27T12:03:36.089Z'), 'test1', '', null, null, id);
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/feed?postType=post`});
      feed = JSON.parse(res.payload);
      expect(feed.length).to.equal(2);
      assert(feed.every(p => p.type === 'post'));
    });

    it('should work with event filter', async () => {
      await insertTransaction(POST_HASH, UNIVERSAL_PROFILE_1, SERIOUS_MAN_UP, '', '', 0);
      const id = await insertEvent(UNIVERSAL_PROFILE_1, POST_HASH, '', 0, '', '');
      await insertPost(POST_HASH6, UNIVERSAL_PROFILE_1, new Date('2022-09-27T12:03:36.089Z'), 'test1', '', null, null, id);
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/feed?postType=event`});
      feed = JSON.parse(res.payload);
      expect(feed.length).to.equal(1);
      assert(feed.every(p => p.type === 'event'));
    });

    it('should return 400 if invalid address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}q/feed`});
      expect(res.statusCode).to.equal(400);
    });
  });
}