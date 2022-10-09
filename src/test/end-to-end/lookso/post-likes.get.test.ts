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
import {API_URL, PROFILES_PER_LOAD} from "../../../environment/config";
import {generateRandomAddress} from "../../helpers/generate-mocks";


export const PostLikesGETTests = () => {

  describe('GET lookso/post/:hash/likes', () => {

    let res: LightMyRequestResponse;
    let payload: {count: number, next: string | null, previous: string | null, results: any[]};

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
      payload = JSON.parse(res.payload);
    });

    it('should return 200', async () => {
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right amount of likes', async () => {
      expect(payload.results.length).to.equal(3);
    });

    it('should return the right followers names and profile images', async () => {
      expect(payload.results.filter(f => f.address === SERIOUS_MAN_UP)[0].name).to.equal('SeriousMan');
      expect(payload.results.filter(f => f.address === SERIOUS_MAN_UP)[0].image).to.equal('url');
      expect(payload.results.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].name).to.equal('UniversalProfile1');
      expect(payload.results.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].image).to.equal('url1');
    });

    it('should return the unnamed at the end', async () => {
      expect(payload.results[payload.results.length - 1].address).to.equal(UNIVERSAL_PROFILE_2);
    });

    it('should work with sender', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes?sender=${SERIOUS_MAN_UP}`});
      payload = JSON.parse(res.payload);
      console.log(payload)
      expect(payload.results.length).to.equal(1);

      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes?sender=${UNIVERSAL_PROFILE_3}`});
      payload = JSON.parse(res.payload);
      expect(payload.results.length).to.equal(0);
    });

    it('should return following status with viewOf', async () => {
      await insertFollow(HACKER_MAN_UP, SERIOUS_MAN_UP);
      res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes?viewOf=${HACKER_MAN_UP}`});
      payload = JSON.parse(res.payload);
      expect(payload.results.filter(f => f.address === SERIOUS_MAN_UP)[0].following).to.equal(true);
      expect(payload.results.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].following).to.equal(false);
      expect(payload.results.filter(f => f.address === UNIVERSAL_PROFILE_2)[0].following).to.equal(false);
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

    describe ('With pagination', () => {
      beforeEach(async () => {
        for (let i = 0; i < PROFILES_PER_LOAD * 2 - 3; i++) {
          const address: string = generateRandomAddress();
          await insertContract(address, 'LSP0');
          await insertContractMetadata(address, '', '', '', false, '');
          await insertLike(address, POST_HASH);
        }
      });

      it ('should return the next page when not in the query', async () => {
        const res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes`});
        payload = JSON.parse(res.payload);
        expect(payload.previous).to.be.null;
        expect(payload.next).to.equal(`${API_URL}/lookso/post/${POST_HASH}/likes?page=1`);
      });

      it ('should return the right amount of posts', async () => {
        const res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes`});
        payload = JSON.parse(res.payload);
        expect(payload.results.length).to.be.equal(PROFILES_PER_LOAD);
      });

      it ('should return the next page', async () => {
        const res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes?page=1`});
        payload = JSON.parse(res.payload);
        expect(payload.next).to.be.null;
        expect(payload.previous).to.equal(`${API_URL}/lookso/post/${POST_HASH}/likes?page=0`);
      });

      it ('should return only one post on the last page if 61 posts in the feed', async () => {
        const address: string = generateRandomAddress();
        await insertContract(address, 'LSP0');
        await insertContractMetadata(address, '', '', '', false, '');
        await insertLike(address, POST_HASH);
        const res = await fastify.inject({method: 'GET', url: `/lookso/post/${POST_HASH}/likes?page=2`});
        payload = JSON.parse(res.payload);
        expect(payload.next).to.be.null;
        expect(payload.previous).to.equal(`${API_URL}/lookso/post/${POST_HASH}/likes?page=1`);
        expect(payload.count).to.equal((PROFILES_PER_LOAD  * 2 + 1));
        expect(payload.results.length).to.equal(1);
      });
    });

  });
}