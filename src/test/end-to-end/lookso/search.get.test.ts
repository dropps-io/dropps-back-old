import { clearDB } from '../../helpers/database-helper';
import { insertContractInterface } from '../../../lib/db/queries/contract-interface.table';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { fastify } from '../../../api/fastify';
import {
  HACKER_MAN_UP,
  HACKER_MAN_UP_CLOSE_ADDRESS,
  SERIOUS_MAN_UP,
} from '../../helpers/constants';
import { insertContractMetadata } from '../../../lib/db/queries/contract-metadata.table';
import { insertImage } from '../../../lib/db/queries/image.table';
import { API_URL, PROFILES_PER_SEARCH } from '../../../environment/config';
import { generateRandomAddress } from '../../helpers/generate-mocks';
import { extractTransaction } from '../../../scripts/blockchain-indexing/extraction/extract-transaction';
import { indexTransaction } from '../../../scripts/blockchain-indexing/indexing/index-transaction';
import { web3 } from '../../../lib/web3';

describe('GET lookso/search/:input', () => {
  let payload: { next: string | null; previous: string | null; search: any };

  beforeEach(async () => {
    await clearDB();
    await insertContractInterface('LSP0', '0xid', 'Universal Profile');
    await insertContract(HACKER_MAN_UP, 'LSP0');
    await insertContract(SERIOUS_MAN_UP, 'LSP0');
    await insertContractMetadata(HACKER_MAN_UP, 'HackerMan', '', '', false, '');
    await insertContractMetadata(SERIOUS_MAN_UP, 'SeriousMan', '', '', false, '');
  });

  it('should return 200 on search', async () => {
    const res = await fastify.inject({ method: 'GET', url: `/lookso/search/se` });
    expect(res.statusCode).toEqual(200);
  });

  it('should return the right profile with name', async () => {
    let res = await fastify.inject({ method: 'GET', url: `/lookso/search/HackerMan` });
    let profiles: any[] = JSON.parse(res.payload).search.profiles.results;
    expect(profiles.length).toEqual(1);
    expect(profiles[0].address).toEqual(HACKER_MAN_UP);

    res = await fastify.inject({ method: 'GET', url: `/lookso/search/SeriousMan` });
    profiles = JSON.parse(res.payload).search.profiles.results;
    expect(profiles.length).toEqual(1);
    expect(profiles[0].address).toEqual(SERIOUS_MAN_UP);
  });

  it('should return name and image', async () => {
    await insertImage(HACKER_MAN_UP, 'url', 300, 300, 'profile', '0x00');
    const res = await fastify.inject({ method: 'GET', url: `/lookso/search/hackerman` });
    const profiles: any[] = JSON.parse(res.payload).search.profiles.results;
    expect(profiles[0].image).toEqual('url');
    expect(profiles[0].name).toEqual('HackerMan');
  });

  it('should not be case sensitive', async () => {
    const res = await fastify.inject({ method: 'GET', url: `/lookso/search/hackerman` });
    const profiles: any[] = JSON.parse(res.payload).search.profiles.results;
    expect(profiles.length).toEqual(1);
    expect(profiles[0].address).toEqual(HACKER_MAN_UP);
  });

  it('should find all profiles containing an input', async () => {
    const res = await fastify.inject({ method: 'GET', url: `/lookso/search/man` });
    payload = JSON.parse(res.payload);
    expect(payload.search.profiles.results.length).toEqual(2);
    expect(payload.search.profiles.count).toEqual('2');
    expect(payload.next).toBeNull();
    expect(payload.previous).toBeNull();
  });

  it('should find all profiles containing a partial address', async () => {
    await insertContract(HACKER_MAN_UP_CLOSE_ADDRESS, 'LSP0');
    await insertContractMetadata(
      HACKER_MAN_UP_CLOSE_ADDRESS,
      'HackerManCloseAddress',
      '',
      '',
      false,
      '',
    );
    const res = await fastify.inject({
      method: 'GET',
      url: `/lookso/search/${HACKER_MAN_UP.slice(0, 6)}`,
    });
    const profiles: any[] = JSON.parse(res.payload).search.profiles.results;
    expect(profiles.length).toEqual(2);
    expect(profiles.map((p) => p.address).includes(HACKER_MAN_UP_CLOSE_ADDRESS)).toBe(true);
    expect(profiles.map((p) => p.address).includes(HACKER_MAN_UP)).toBe(true);
  });

  it('should find profile with address', async () => {
    const res = await fastify.inject({ method: 'GET', url: `/lookso/search/${SERIOUS_MAN_UP}` });
    const profiles: any[] = JSON.parse(res.payload).search.profiles.results;
    console.log();
    expect(profiles.length).toEqual(1);
    expect(profiles[0].address).toEqual(SERIOUS_MAN_UP);
  });

  describe('With pagination', () => {
    beforeEach(async () => {
      for (let i = 0; i < PROFILES_PER_SEARCH * 2 - 2; i++) {
        const address: string = generateRandomAddress();
        await insertContract(address, 'LSP0');
        await insertContractMetadata(address, 'man', '', '', false, '');
      }
    });

    it('should return the next page when not in the query', async () => {
      const res = await fastify.inject({ method: 'GET', url: `/lookso/search/man` });
      payload = JSON.parse(res.payload);
      expect(payload.previous).toBeNull();
      expect(payload.next).toEqual(API_URL + '/lookso/search/man?page=1');
    });

    it('should return the right amount of posts', async () => {
      const res = await fastify.inject({ method: 'GET', url: `/lookso/search/man` });
      payload = JSON.parse(res.payload);
      expect(payload.search.profiles.results.length).toEqual(PROFILES_PER_SEARCH);
    });

    it('should return the next page', async () => {
      const res = await fastify.inject({ method: 'GET', url: `/lookso/search/man?page=1` });
      payload = JSON.parse(res.payload);
      expect(payload.next).toBeNull();
      expect(payload.previous).toEqual(API_URL + '/lookso/search/man?page=0');
    });

    it('should return only one post on the last page if 61 posts in the feed', async () => {
      const address: string = generateRandomAddress();
      await insertContract(address, 'LSP0');
      await insertContractMetadata(address, 'man', '', '', false, '');
      const res = await fastify.inject({ method: 'GET', url: `/lookso/search/man?page=2` });
      payload = JSON.parse(res.payload);
      expect(payload.next).toBeNull();
      expect(payload.previous).toEqual(API_URL + '/lookso/search/man?page=1');
      expect(payload.search.profiles.count).toEqual((PROFILES_PER_SEARCH * 2 + 1).toString());
      expect(payload.search.profiles.results.length).toEqual(1);
    });

    it('should return the transaction if transaction hash as input', async () => {
      const txHash = '0x2ca290ebbb726586d998ccda69a7438b0ddeef4812e36073e44f291d1247e1a4';
      const tx = await extractTransaction(txHash);
      await indexTransaction(tx.transaction, tx.params, tx.decodedParams);
      const res = await fastify.inject({ method: 'GET', url: `/lookso/search/${txHash}` });
      payload = JSON.parse(res.payload);
      expect(payload.next).toBeNull();
      expect(payload.previous).toEqual(null);
      expect(payload.search.profiles.count).toEqual(0);
      expect(payload.search.transactions.count).toEqual(1);
      expect(payload.search.transactions.results[0].from).toEqual(
        web3.utils.toChecksumAddress('0x24b04685eff4dbcc6382715c73f4a61566d4967e'),
      );
      expect(payload.search.transactions.results[0].to).toEqual(
        web3.utils.toChecksumAddress('0x42d6fe6eb3fc1e5585ab958fb77780327991781b'),
      );
      expect(payload.search.transactions.results[0].value).toEqual('0');
      expect(payload.search.transactions.results[0].blockNumber).toEqual(1735565);
    });
  });
});
