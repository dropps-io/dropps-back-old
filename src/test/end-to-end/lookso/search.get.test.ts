import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {insertContractInterface} from "../../../bin/db/contract-interface.table";
import {insertContract} from "../../../bin/db/contract.table";
import {fastify} from "../../../lib/fastify";
import {assert, expect} from "chai";
import {HACKER_MAN_UP, HACKER_MAN_UP_CLOSE_ADDRESS, SERIOUS_MAN_UP} from "../../helpers/constants";
import {insertContractMetadata} from "../../../bin/db/contract-metadata.table";

export const SearchGETTests = () => {
  describe('GET lookso/search/:input', () => {

    beforeEach(async () => {
      await clearDB();
      await insertContractInterface('LSP0', '0xid', 'Universal Profile');
      await insertContract(HACKER_MAN_UP, 'LSP0');
      await insertContract(SERIOUS_MAN_UP, 'LSP0');
      await insertContractMetadata(HACKER_MAN_UP, 'HackerMan', '', '', false, '');
      await insertContractMetadata(SERIOUS_MAN_UP, 'SeriousMan', '', '', false, '');
    });

    it('should return 200 on search', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/search/se`});
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right profile with name', async () => {
      let res = await fastify.inject({method: 'GET', url: `/lookso/search/HackerMan`});
      let profiles: any[] = JSON.parse(res.payload);
      expect(profiles.length).to.equal(1);
      expect(profiles[0].address).to.equal(HACKER_MAN_UP);

      res = await fastify.inject({method: 'GET', url: `/lookso/search/SeriousMan`});
      profiles = JSON.parse(res.payload);
      expect(profiles.length).to.equal(1);
      expect(profiles[0].address).to.equal(SERIOUS_MAN_UP);
    });

    it('should not be case sensitive', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/search/hackerman`});
      const profiles: any[] = JSON.parse(res.payload);
      expect(profiles.length).to.equal(1);
      expect(profiles[0].address).to.equal(HACKER_MAN_UP);
    });

    it('should find all profiles containing an input', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/search/man`});
      const profiles: any[] = JSON.parse(res.payload);
      expect(profiles.length).to.equal(2);
    });

    it('should find all profiles containing a partial address', async () => {
      await insertContract(HACKER_MAN_UP_CLOSE_ADDRESS, 'LSP0');
      await insertContractMetadata(HACKER_MAN_UP_CLOSE_ADDRESS, 'HackerManCloseAddress', '', '', false, '');
      const res = await fastify.inject({method: 'GET', url: `/lookso/search/${HACKER_MAN_UP.slice(0, 6)}`});
      const profiles: any[] = JSON.parse(res.payload);
      expect(profiles.length).to.equal(2);
      assert(profiles.map(p => p.address).includes(HACKER_MAN_UP_CLOSE_ADDRESS));
      assert(profiles.map(p => p.address).includes(HACKER_MAN_UP));
    });

    it('should find profile with address', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/search/${SERIOUS_MAN_UP}`});
      const profiles: any[] = JSON.parse(res.payload);
      expect(profiles.length).to.equal(1);
      expect(profiles[0].address).to.equal(SERIOUS_MAN_UP);
    });

    it('should work with limit', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/search/man?limit=1`});
      const profiles: any[] = JSON.parse(res.payload);
      expect(profiles.length).to.equal(1);
    });

    it('should work with offset', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/search/man?offset=1`});
      const profiles: any[] = JSON.parse(res.payload);
      expect(profiles.length).to.equal(1);
    });
  });
}