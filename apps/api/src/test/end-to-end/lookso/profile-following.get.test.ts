import { LightMyRequestResponse } from 'fastify';

import { clearDB } from '../../helpers/database-helper';
import { insertContractInterface } from '../../../lib/db/queries/contract-interface.table';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { fastify } from '../../../api/fastify';
import { insertFollow } from '../../../lib/db/queries/follow.table';
import {
  HACKER_MAN_UP,
  SERIOUS_MAN_UP,
  UNIVERSAL_PROFILE_1,
  UNIVERSAL_PROFILE_2,
} from '../../helpers/constants';
import { insertImage } from '../../../lib/db/queries/image.table';
import { insertContractMetadata } from '../../../lib/db/queries/contract-metadata.table';
import { API_URL, PROFILES_PER_LOAD } from '../../../environment/config';
import { generateRandomAddress } from '../../helpers/generate-mocks';

describe('GET lookso/profile/:address/following', () => {
  let res: LightMyRequestResponse;
  let payload: { count: number; next: string | null; previous: string | null; results: any[] };

  beforeEach(async () => {
    await clearDB();
    await insertContractInterface('LSP0', '0xid', 'Universal Profile');
    await insertContract(HACKER_MAN_UP, 'LSP0');
    await insertContract(SERIOUS_MAN_UP, 'LSP0');
    await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
    await insertContract(UNIVERSAL_PROFILE_2, 'LSP0');
    await insertContractMetadata(SERIOUS_MAN_UP, 'SeriousMan', 'HM', 'Description', false, '');
    await insertContractMetadata(
      UNIVERSAL_PROFILE_1,
      'UniversalProfile1',
      'HM',
      'Description',
      false,
      '',
    );
    await insertImage(SERIOUS_MAN_UP, 'url', 300, 300, 'profile', '0x00');
    await insertImage(UNIVERSAL_PROFILE_1, 'url1', 300, 300, 'profile', '0x00');
    await insertFollow(HACKER_MAN_UP, SERIOUS_MAN_UP);
    await insertFollow(HACKER_MAN_UP, UNIVERSAL_PROFILE_1);
    await insertFollow(SERIOUS_MAN_UP, UNIVERSAL_PROFILE_1);
    await insertFollow(UNIVERSAL_PROFILE_1, HACKER_MAN_UP);

    res = await fastify.inject({
      method: 'GET',
      url: `/lookso/profile/${HACKER_MAN_UP}/following`,
    });
    payload = JSON.parse(res.payload);
  });

  it('should return 200', async () => {
    expect(res.statusCode).toEqual(200);
  });

  it('should return the right amount of following', async () => {
    expect(payload.results.length).toEqual(2);
  });

  it('should return the right following names and profile images', async () => {
    expect(payload.results.filter((f) => f.address === SERIOUS_MAN_UP)[0].name).toEqual(
      'SeriousMan',
    );
    expect(payload.results.filter((f) => f.address === SERIOUS_MAN_UP)[0].image).toEqual('url');
    expect(payload.results.filter((f) => f.address === UNIVERSAL_PROFILE_1)[0].name).toEqual(
      'UniversalProfile1',
    );
    expect(payload.results.filter((f) => f.address === UNIVERSAL_PROFILE_1)[0].image).toEqual(
      'url1',
    );
  });

  it('should return following status with viewOf', async () => {
    res = await fastify.inject({
      method: 'GET',
      url: `/lookso/profile/${HACKER_MAN_UP}/following?viewOf=${HACKER_MAN_UP}`,
    });
    payload = JSON.parse(res.payload);
    expect(payload.results.filter((f) => f.address === SERIOUS_MAN_UP)[0].following).toEqual(true);
    expect(payload.results.filter((f) => f.address === UNIVERSAL_PROFILE_1)[0].following).toEqual(
      true,
    );

    res = await fastify.inject({
      method: 'GET',
      url: `/lookso/profile/${HACKER_MAN_UP}/following?viewOf=${SERIOUS_MAN_UP}`,
    });
    payload = JSON.parse(res.payload);
    expect(payload.results.filter((f) => f.address === SERIOUS_MAN_UP)[0].following).toEqual(false);
    expect(payload.results.filter((f) => f.address === UNIVERSAL_PROFILE_1)[0].following).toEqual(
      true,
    );
  });

  it('should return 400 if invalid address', async () => {
    res = await fastify.inject({
      method: 'GET',
      url: `/lookso/profile/${HACKER_MAN_UP}q/following`,
    });
    expect(res.statusCode).toEqual(400);
  });

  it('should return 400 if invalid viewOf address', async () => {
    res = await fastify.inject({
      method: 'GET',
      url: `/lookso/profile/${HACKER_MAN_UP}/following?viewOf=${HACKER_MAN_UP}q`,
    });
    expect(res.statusCode).toEqual(400);
  });

  describe('With pagination', () => {
    beforeEach(async () => {
      for (let i = 0; i < PROFILES_PER_LOAD * 2 - 2; i++) {
        const address: string = generateRandomAddress();
        await insertContract(address, 'LSP0');
        await insertContractMetadata(address, '', '', '', false, '');
        await insertFollow(HACKER_MAN_UP, address);
      }
    });

    it('should return the next page when not in the query', async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: `/lookso/profile/${HACKER_MAN_UP}/following`,
      });
      payload = JSON.parse(res.payload);
      expect(payload.previous).toBeNull();
      expect(payload.next).toEqual(`${API_URL}/lookso/profile/${HACKER_MAN_UP}/following?page=1`);
    });

    it('should return the right amount of posts', async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: `/lookso/profile/${HACKER_MAN_UP}/following`,
      });
      payload = JSON.parse(res.payload);
      expect(payload.results.length).toEqual(PROFILES_PER_LOAD);
    });

    it('should return the next page', async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: `/lookso/profile/${HACKER_MAN_UP}/following?page=1`,
      });
      payload = JSON.parse(res.payload);
      expect(payload.next).toBeNull();
      expect(payload.previous).toEqual(
        `${API_URL}/lookso/profile/${HACKER_MAN_UP}/following?page=0`,
      );
    });

    it('should return only one post on the last page if 61 posts in the feed', async () => {
      const address: string = generateRandomAddress();
      await insertContract(address, 'LSP0');
      await insertContractMetadata(address, '', '', '', false, '');
      await insertFollow(HACKER_MAN_UP, address);
      const res = await fastify.inject({
        method: 'GET',
        url: `/lookso/profile/${HACKER_MAN_UP}/following?page=2`,
      });
      payload = JSON.parse(res.payload);
      expect(payload.next).toBeNull();
      expect(payload.previous).toEqual(
        `${API_URL}/lookso/profile/${HACKER_MAN_UP}/following?page=1`,
      );
      expect(payload.count).toEqual(PROFILES_PER_LOAD * 2 + 1);
      expect(payload.results.length).toEqual(1);
    });
  });
});
