import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {insertContractInterface} from "../../../bin/db/contract-interface.table";
import {insertContract} from "../../../bin/db/contract.table";
import {fastify} from "../../../lib/fastify";
import {assert, expect} from "chai";
import {HACKER_MAN_UP, HACKER_MAN_UP_CLOSE_ADDRESS, SERIOUS_MAN_UP} from "../../helpers/constants";
import {insertContractMetadata} from "../../../bin/db/contract-metadata.table";
import {insertImage} from "../../../bin/db/image.table";
import {FeedPost} from "../../../models/types/feed-post";
import {API_URL, PROFILES_PER_SEARCH} from "../../../environment/config";
import {generateRandomAddress} from "../../helpers/generate-mocks";

export const SearchGETTests = () => {
  describe('GET lookso/search/:input', () => {

    let payload: {count: number, next: string | null, previous: string | null, results: FeedPost[]};

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
      let profiles: any[] = JSON.parse(res.payload).results;
      expect(profiles.length).to.equal(1);
      expect(profiles[0].address).to.equal(HACKER_MAN_UP);

      res = await fastify.inject({method: 'GET', url: `/lookso/search/SeriousMan`});
      profiles = JSON.parse(res.payload).results;
      expect(profiles.length).to.equal(1);
      expect(profiles[0].address).to.equal(SERIOUS_MAN_UP);
    });

    it('should return name and image', async () => {
      await insertImage(HACKER_MAN_UP, 'url', 300, 300, 'profile', '0x00');
      const res = await fastify.inject({method: 'GET', url: `/lookso/search/hackerman`});
      const profiles: any[] = JSON.parse(res.payload).results;
      expect(profiles[0].image).to.equal('url');
      expect(profiles[0].name).to.equal('HackerMan');
    });

    it('should not be case sensitive', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/search/hackerman`});
      const profiles: any[] = JSON.parse(res.payload).results;
      expect(profiles.length).to.equal(1);
      expect(profiles[0].address).to.equal(HACKER_MAN_UP);
    });

    it('should find all profiles containing an input', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/search/man`});
      payload = JSON.parse(res.payload);
      expect(payload.results.length).to.equal(2);
      expect(payload.count).to.equal('2');
      expect(payload.next).to.be.null;
      expect(payload.previous).to.be.null;
    });

    it('should find all profiles containing a partial address', async () => {
      await insertContract(HACKER_MAN_UP_CLOSE_ADDRESS, 'LSP0');
      await insertContractMetadata(HACKER_MAN_UP_CLOSE_ADDRESS, 'HackerManCloseAddress', '', '', false, '');
      const res = await fastify.inject({method: 'GET', url: `/lookso/search/${HACKER_MAN_UP.slice(0, 6)}`});
      const profiles: any[] = JSON.parse(res.payload).results;
      expect(profiles.length).to.equal(2);
      assert(profiles.map(p => p.address).includes(HACKER_MAN_UP_CLOSE_ADDRESS));
      assert(profiles.map(p => p.address).includes(HACKER_MAN_UP));
    });

    it('should find profile with address', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/search/${SERIOUS_MAN_UP}`});
      const profiles: any[] = JSON.parse(res.payload).results;
      expect(profiles.length).to.equal(1);
      expect(profiles[0].address).to.equal(SERIOUS_MAN_UP);
    });

    describe ('With pagination', () => {
      beforeEach(async () => {
        for (let i = 0; i < PROFILES_PER_SEARCH * 2 - 2; i++) {
          const address: string = generateRandomAddress();
          await insertContract(address, 'LSP0');
          await insertContractMetadata(address, 'man', '', '', false, '');
        }
      });

      it ('should return the next page when not in the query', async () => {
        const res = await fastify.inject({method: 'GET', url: `/lookso/search/man`});
        payload = JSON.parse(res.payload);
        expect(payload.previous).to.be.null;
        expect(payload.next).to.equal(API_URL + '/lookso/search/man?page=1');
      });

      it ('should return the right amount of posts', async () => {
        const res = await fastify.inject({method: 'GET', url: `/lookso/search/man`});
        payload = JSON.parse(res.payload);
        expect(payload.results.length).to.be.equal(PROFILES_PER_SEARCH);
      });

      it ('should return the next page', async () => {
        const res = await fastify.inject({method: 'GET', url: `/lookso/search/man?page=1`});
        payload = JSON.parse(res.payload);
        expect(payload.next).to.be.null;
        expect(payload.previous).to.equal(API_URL + '/lookso/search/man?page=0');
      });

      it ('should return only one post on the last page if 61 posts in the feed', async () => {
        const address: string = generateRandomAddress();
        await insertContract(address, 'LSP0');
        await insertContractMetadata(address, 'man', '', '', false, '');
        const res = await fastify.inject({method: 'GET', url: `/lookso/search/man?page=2`});
        payload = JSON.parse(res.payload);
        expect(payload.next).to.be.null;
        expect(payload.previous).to.equal(API_URL + '/lookso/search/man?page=1');
        expect(payload.count).to.equal((PROFILES_PER_SEARCH  * 2 + 1).toString());
        expect(payload.results.length).to.equal(1);
      });
    });
  });
}