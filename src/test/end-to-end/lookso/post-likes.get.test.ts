import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {insertContractInterface} from "../../../bin/db/contract-interface.table";
import {insertContract} from "../../../bin/db/contract.table";
import {fastify} from "../../../lib/fastify";
import {expect} from "chai";
import {LightMyRequestResponse} from "fastify";
import {insertFollow} from "../../../bin/db/follow.table";
import {HACKER_MAN_UP, POST_HASH, SERIOUS_MAN_UP, UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, UNIVERSAL_PROFILE_3} from "../../helpers/constants";
import {insertImage} from "../../../bin/db/image.table";
import {insertContractMetadata} from "../../../bin/db/contract-metadata.table";
import {insertPost} from "../../../bin/db/post.table";
import {insertLike} from "../../../bin/db/like.table";


export const PostLikesGETTests = () => {

  describe('GET lookso/post/:hash/likes', () => {

    let res: LightMyRequestResponse;
    let likes: any[];

    beforeEach(async () => {
      await clearDB();
      await insertContractInterface('LSP0', '0xid', 'Universal Profile');
      await insertContract(HACKER_MAN_UP, 'LSP0');
      await insertContract(SERIOUS_MAN_UP, 'LSP0');
      await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
      await insertContract(UNIVERSAL_PROFILE_2, 'LSP0');
      await insertContractMetadata(SERIOUS_MAN_UP, 'SeriousMan', 'HM', 'Description', false, '');
      await insertContractMetadata(UNIVERSAL_PROFILE_1, 'UniversalProfile1', 'HM', 'Description', false, '');
      await insertContractMetadata(UNIVERSAL_PROFILE_2, '', '', 'Description', false, '');
      await insertImage(SERIOUS_MAN_UP, 'url', 300, 300, 'profile', '0x00');
      await insertImage(UNIVERSAL_PROFILE_1, 'url1', 300, 300, 'profile', '0x00');
      await insertPost(POST_HASH, HACKER_MAN_UP, new Date('2022-09-27T12:03:31.089Z'), 'test', '', null, null, null);
      await insertLike(UNIVERSAL_PROFILE_2, POST_HASH);
      await insertLike(SERIOUS_MAN_UP, POST_HASH);
      await insertLike(UNIVERSAL_PROFILE_1, POST_HASH);

      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes`});
      likes = JSON.parse(res.payload);
    });

    it('should return 200', async () => {
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right amount of likes', async () => {
      expect(likes.length).to.equal(3);
    });

    it('should return the right followers names and profile images', async () => {
      expect(likes.filter(f => f.address === SERIOUS_MAN_UP)[0].name).to.equal('SeriousMan');
      expect(likes.filter(f => f.address === SERIOUS_MAN_UP)[0].image).to.equal('url');
      expect(likes.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].name).to.equal('UniversalProfile1');
      expect(likes.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].image).to.equal('url1');
    });

    it('should return the unnamed at the end', async () => {
      expect(likes[likes.length - 1].address).to.equal(UNIVERSAL_PROFILE_2);
    });

    it('should work with limit', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes?limit=1`});
      likes = JSON.parse(res.payload);
      expect(likes.length).to.equal(1);
    });

    it('should work with offset', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes?offset=1`});
      likes = JSON.parse(res.payload);
      expect(likes.length).to.equal(2);
    });

    it('should work with sender', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes?sender=${SERIOUS_MAN_UP}`});
      likes = JSON.parse(res.payload);
      expect(likes.length).to.equal(1);

      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes?sender=${UNIVERSAL_PROFILE_3}`});
      likes = JSON.parse(res.payload);
      expect(likes.length).to.equal(0);
    });

    it('should return following status with viewOf', async () => {
      await insertFollow(HACKER_MAN_UP, SERIOUS_MAN_UP);
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes?viewOf=${HACKER_MAN_UP}`});
      likes = JSON.parse(res.payload);
      expect(likes.filter(f => f.address === SERIOUS_MAN_UP)[0].following).to.equal(true);
      expect(likes.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].following).to.equal(false);
      expect(likes.filter(f => f.address === UNIVERSAL_PROFILE_2)[0].following).to.equal(false);
    });

    it('should return 400 if invalid hash', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}q/likes`});
      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if invalid viewOf address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes?viewOf=${HACKER_MAN_UP}q`});
      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if invalid sender address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes?sender=${HACKER_MAN_UP}q`});
      expect(res.statusCode).to.equal(400);
    });
  });
}