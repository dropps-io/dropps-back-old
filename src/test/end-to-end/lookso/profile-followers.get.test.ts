import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {insertContractInterface} from "../../../lib/db/queries/contract-interface.table";
import {insertContract} from "../../../lib/db/queries/contract.table";
import {fastify} from "../../../api/fastify";
import {expect} from "chai";
import {LightMyRequestResponse} from "fastify";
import {insertFollow} from "../../../lib/db/queries/follow.table";
import {HACKER_MAN_UP, SERIOUS_MAN_UP, UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, UNIVERSAL_PROFILE_3} from "../../helpers/constants";
import {insertImage} from "../../../lib/db/queries/image.table";
import {insertContractMetadata} from "../../../lib/db/queries/contract-metadata.table";
import {API_URL, PROFILES_PER_LOAD} from "../../../environment/config";
import {generateRandomAddress} from "../../helpers/generate-mocks";

export const ProfileFollowersGETTests = () => {

  describe('GET lookso/profile/:address/followers', () => {

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
      await insertImage(SERIOUS_MAN_UP, 'url', 300, 300, 'profile', '0x00');
      await insertImage(UNIVERSAL_PROFILE_1, 'url1', 300, 300, 'profile', '0x00');
      await insertFollow(HACKER_MAN_UP, SERIOUS_MAN_UP);
      await insertFollow(SERIOUS_MAN_UP, HACKER_MAN_UP);
      await insertFollow(UNIVERSAL_PROFILE_1, HACKER_MAN_UP);

      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers`});
      payload = JSON.parse(res.payload);
    });

    it('should return 200', async () => {
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right amount of followers', async () => {
      expect(payload.results.length).to.equal(2);
    });

    it('should return the right followers names and profile images', async () => {
      expect(payload.results.filter(f => f.address === SERIOUS_MAN_UP)[0].name).to.equal('SeriousMan');
      expect(payload.results.filter(f => f.address === SERIOUS_MAN_UP)[0].image).to.equal('url');
      expect(payload.results.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].name).to.equal('UniversalProfile1');
      expect(payload.results.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].image).to.equal('url1');
    });

    it('should work with follower address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?follower=${SERIOUS_MAN_UP}`});
      payload = JSON.parse(res.payload);
      expect(payload.results.length).to.equal(1);

      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?follower=${UNIVERSAL_PROFILE_3}`});
      payload = JSON.parse(res.payload);
      expect(payload.results.length).to.equal(0);
    });

    it('should return following status with viewOf', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?viewOf=${HACKER_MAN_UP}`});
      payload = JSON.parse(res.payload);
      expect(payload.results.filter(f => f.address === SERIOUS_MAN_UP)[0].following).to.equal(true);
      expect(payload.results.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].following).to.equal(false);
    });

    it('should return 400 if invalid address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}q/followers`});
      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if invalid viewOf address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?viewOf=${HACKER_MAN_UP}q`});
      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if invalid follower address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?follower=${HACKER_MAN_UP}q`});
      expect(res.statusCode).to.equal(400);
    });

    describe ('With pagination', () => {
      beforeEach(async () => {
        for (let i = 0; i < PROFILES_PER_LOAD * 2 - 2; i++) {
          const address: string = generateRandomAddress();
          await insertContract(address, 'LSP0');
          await insertContractMetadata(address, '', '', '', false, '');
          await insertFollow(address, HACKER_MAN_UP);
        }
      });

      it ('should return the next page when not in the query', async () => {
        const res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers`});
        payload = JSON.parse(res.payload);
        expect(payload.previous).to.be.null;
        expect(payload.next).to.equal(`${API_URL}/lookso/profile/${HACKER_MAN_UP}/followers?page=1`);
      });

      it ('should return the right amount of posts', async () => {
        const res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers`});
        payload = JSON.parse(res.payload);
        expect(payload.results.length).to.be.equal(PROFILES_PER_LOAD);
      });

      it ('should return the next page', async () => {
        const res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?page=1`});
        payload = JSON.parse(res.payload);
        expect(payload.next).to.be.null;
        expect(payload.previous).to.equal(`${API_URL}/lookso/profile/${HACKER_MAN_UP}/followers?page=0`);
      });

      it ('should return only one post on the last page if 61 posts in the feed', async () => {
        const address: string = generateRandomAddress();
        await insertContract(address, 'LSP0');
        await insertContractMetadata(address, '', '', '', false, '');
        await insertFollow(address, HACKER_MAN_UP);
        const res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?page=2`});
        payload = JSON.parse(res.payload);
        expect(payload.next).to.be.null;
        expect(payload.previous).to.equal(`${API_URL}/lookso/profile/${HACKER_MAN_UP}/followers?page=1`);
        expect(payload.count).to.equal((PROFILES_PER_LOAD  * 2 + 1));
        expect(payload.results.length).to.equal(1);
      });
    });

  });
}