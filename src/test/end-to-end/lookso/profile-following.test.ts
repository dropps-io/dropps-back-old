import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {insertContractInterface} from "../../../bin/db/contract-interface.table";
import {insertContract} from "../../../bin/db/contract.table";
import {fastify} from "../../../lib/fastify";
import {LightMyRequestResponse} from "fastify";
import {insertFollow} from "../../../bin/db/follow.table";
import {expect} from "chai";
import {HACKER_MAN_UP, SERIOUS_MAN_UP, UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2} from "../../helpers/constants";
import {insertImage} from "../../../bin/db/image.table";
import {insertContractMetadata} from "../../../bin/db/contract-metadata.table";


export const ProfileFollowingGETTests = () => {

  describe('GET lookso/profile/:address/following', () => {

    let res: LightMyRequestResponse;
    let following: any[];

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
      await insertFollow(HACKER_MAN_UP, UNIVERSAL_PROFILE_1);
      await insertFollow(SERIOUS_MAN_UP, UNIVERSAL_PROFILE_1);
      await insertFollow(UNIVERSAL_PROFILE_1, HACKER_MAN_UP);

      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/following`});
      following = JSON.parse(res.payload);
    });

    it('should return 200', async () => {
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right amount of following', async () => {
      expect(following.length).to.equal(2);
    });

    it('should return the right following names and profile images', async () => {
      expect(following.filter(f => f.address === SERIOUS_MAN_UP)[0].name).to.equal('SeriousMan');
      expect(following.filter(f => f.address === SERIOUS_MAN_UP)[0].image).to.equal('url');
      expect(following.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].name).to.equal('UniversalProfile1');
      expect(following.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].image).to.equal('url1');
    });

    it('should work with limit', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/following?limit=1`});
      following = JSON.parse(res.payload);
      expect(following.length).to.equal(1);
    });

    it('should work with offset', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/following?offset=1`});
      following = JSON.parse(res.payload);
      expect(following.length).to.equal(1);
    });

    it('should return following status with viewOf', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/following?viewOf=${HACKER_MAN_UP}`});
      following = JSON.parse(res.payload);
      expect(following.filter(f => f.address === SERIOUS_MAN_UP)[0].following).to.equal(true);
      expect(following.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].following).to.equal(true);

      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/following?viewOf=${SERIOUS_MAN_UP}`});
      following = JSON.parse(res.payload);
      expect(following.filter(f => f.address === SERIOUS_MAN_UP)[0].following).to.equal(false);
      expect(following.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].following).to.equal(true);
    });

    it('should return 400 if invalid address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}q/following`});
      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if invalid viewOf address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/following?viewOf=${HACKER_MAN_UP}q`});
      expect(res.statusCode).to.equal(400);
    });

  });
}