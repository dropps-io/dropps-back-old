import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {insertContractInterface} from "../../../lib/db/queries/contract-interface.table";
import {insertContract} from "../../../lib/db/queries/contract.table";
import {insertPost} from "../../../lib/db/queries/post.table";
import {fastify} from "../../../api/fastify";
import {expect} from "chai";
import {insertLike} from "../../../lib/db/queries/like.table";
import {FeedPost} from "../../../models/types/feed-post";
import {insertEvent} from "../../../lib/db/queries/event.table";
import {insertTransaction} from "../../../lib/db/queries/transaction.table";
import {
  HACKER_MAN_UP, POST_HASH, POST_HASH2, SERIOUS_MAN_UP
} from "../../helpers/constants";
import {insertContractMetadata} from "../../../lib/db/queries/contract-metadata.table";
import {insertImage} from "../../../lib/db/queries/image.table";

export const PostGETTests = () => {

  describe('GET lookso/post/:hash', () => {

    beforeEach(async () => {
      await clearDB();
      await insertContractInterface('LSP0', '0xid', 'Universal Profile');
      await insertContract(HACKER_MAN_UP, 'LSP0');
      await insertContractMetadata(HACKER_MAN_UP, 'HackerMan', 'HM', 'Description', false, '');
      await insertImage(HACKER_MAN_UP, 'url', 300, 300, 'profile', '0x00');
      await insertPost(POST_HASH, HACKER_MAN_UP, new Date('2022-09-27T12:03:31.089Z'), 'test', '', null, null, null);
    });

    it('should return 200', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}`});
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right data', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}`});
      const post = JSON.parse(res.payload) as FeedPost;
      expect(post.type).to.equal('post');
      expect(post.hash).to.equal(POST_HASH);
      expect(post.author.address).to.equal(HACKER_MAN_UP);
      expect(post.author.name).to.equal('HackerMan');
      expect(post.author.image).to.equal('url');
      expect(post.comments).to.equal(0);
      expect(post.likes).to.equal(0);
      expect(post.reposts).to.equal(0);
    });

    it('should return the right type if event', async () => {
      await insertContract(SERIOUS_MAN_UP, 'LSP0');
      await insertTransaction(POST_HASH, HACKER_MAN_UP, SERIOUS_MAN_UP, '', '', 0);
      const id = await insertEvent(HACKER_MAN_UP, POST_HASH, '', 0, '', '');
      await insertPost(POST_HASH2, HACKER_MAN_UP, new Date('2022-09-27T12:03:36.089Z'), 'test1', '', null, null, id);
      const res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH2}`});
      const post = JSON.parse(res.payload) as FeedPost;
      expect(post.type).to.equal('event');
    });

    it('should return the right comments amount', async () => {
      await insertPost(POST_HASH2, HACKER_MAN_UP, new Date('2022-09-27T12:03:31.089Z'), 'test', '', POST_HASH, null, null);
      const res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}`});
      const post = JSON.parse(res.payload) as FeedPost;
      expect(post.comments).to.equal(1);
    });

    it('should return the right reposts amount', async () => {
      await insertPost(POST_HASH2, HACKER_MAN_UP, new Date('2022-09-27T12:03:31.089Z'), 'test', '', null, POST_HASH, null);
      const res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}`});
      const post = JSON.parse(res.payload) as FeedPost;
      expect(post.reposts).to.equal(1);
    });

    it('should return the right likes amount', async () => {
      await insertContract(SERIOUS_MAN_UP, 'LSP0');
      await insertLike(SERIOUS_MAN_UP, POST_HASH);
      const res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}`});
      const post = JSON.parse(res.payload) as FeedPost;
      expect(post.likes).to.equal(1);
    });

    it('should return isLiked if viewOf', async () => {
      await insertContract(SERIOUS_MAN_UP, 'LSP0');
      await insertLike(SERIOUS_MAN_UP, POST_HASH);
      const res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}?viewOf=${SERIOUS_MAN_UP}`});
      const post = JSON.parse(res.payload) as FeedPost;
      expect(post.isLiked).to.equal(true);
    });

    it('should return 400 if invalid viewOf', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}?viewOf=${SERIOUS_MAN_UP}q`});
      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if invalid hash', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}q`});
      expect(res.statusCode).to.equal(400);
    });
  });
}