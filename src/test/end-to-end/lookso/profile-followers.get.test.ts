import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {insertContractInterface} from "../../../bin/db/contract-interface.table";
import {insertContract} from "../../../bin/db/contract.table";
import {fastify} from "../../../lib/fastify";
import {expect} from "chai";
import {LightMyRequestResponse} from "fastify";
import {insertFollow} from "../../../bin/db/follow.table";
import {HACKER_MAN_UP, SERIOUS_MAN_UP, UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, UNIVERSAL_PROFILE_3} from "../../helpers/constants";
import {insertImage} from "../../../bin/db/image.table";
import {insertContractMetadata} from "../../../bin/db/contract-metadata.table";


export const ProfileFollowersGETTests = () => {

  describe('GET lookso/profile/:address/followers', () => {

    let res: LightMyRequestResponse;
    let followers: any[];

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
      followers = JSON.parse(res.payload);
    });

    it('should return 200', async () => {
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right amount of followers', async () => {
      expect(followers.length).to.equal(2);
    });

    it('should return the right followers names and profile images', async () => {
      expect(followers.filter(f => f.address === SERIOUS_MAN_UP)[0].name).to.equal('SeriousMan');
      expect(followers.filter(f => f.address === SERIOUS_MAN_UP)[0].image).to.equal('url');
      expect(followers.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].name).to.equal('UniversalProfile1');
      expect(followers.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].image).to.equal('url1');
    });

    it('should work with limit', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?limit=1`});
      followers = JSON.parse(res.payload);
      expect(followers.length).to.equal(1);
    });

    it('should work with offset', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?offset=1`});
      followers = JSON.parse(res.payload);
      expect(followers.length).to.equal(1);
    });

    it('should work with followerAddress', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?followerAddress=${SERIOUS_MAN_UP}`});
      followers = JSON.parse(res.payload);
      expect(followers.length).to.equal(1);

      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?followerAddress=${UNIVERSAL_PROFILE_3}`});
      followers = JSON.parse(res.payload);
      expect(followers.length).to.equal(0);
    });

    it('should return following status with viewOf', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?viewOf=${HACKER_MAN_UP}`});
      followers = JSON.parse(res.payload);
      expect(followers.filter(f => f.address === SERIOUS_MAN_UP)[0].following).to.equal(true);
      expect(followers.filter(f => f.address === UNIVERSAL_PROFILE_1)[0].following).to.equal(false);
    });

    it('should return 400 if invalid address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}q/followers`});
      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if invalid viewOf address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?viewOf=${HACKER_MAN_UP}q`});
      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if invalid followerAddress address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/followers?followerAddress=${HACKER_MAN_UP}q`});
      expect(res.statusCode).to.equal(400);
    });
  });
}