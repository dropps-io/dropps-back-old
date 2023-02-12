import { describe } from 'mocha';
import { expect } from 'chai';

import { clearDB } from '../../helpers/database-helper';
import { insertContractInterface } from '../../../lib/db/queries/contract-interface.table';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { insertFollow } from '../../../lib/db/queries/follow.table';
import {
  HACKER_MAN_UP,
  SERIOUS_MAN_UP,
  UNIVERSAL_PROFILE_1,
  UNIVERSAL_PROFILE_2,
} from '../../helpers/constants';
import { fastify } from '../../../api/fastify';

export const ProfileFollowCountGETTests = () => {
  describe('GET lookso/profile/:address/following/count', () => {
    beforeEach(async () => {
      await clearDB();
      await insertContractInterface('LSP0', '0xid', 'Universal Profile');
      await insertContract(HACKER_MAN_UP, 'LSP0');
      await insertContract(SERIOUS_MAN_UP, 'LSP0');
      await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
      await insertContract(UNIVERSAL_PROFILE_2, 'LSP0');
      await insertFollow(HACKER_MAN_UP, SERIOUS_MAN_UP);
      await insertFollow(HACKER_MAN_UP, UNIVERSAL_PROFILE_1);
    });

    it('should return 200', async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: `/lookso/profile/${HACKER_MAN_UP}/following/count`,
      });
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right following count', async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: `/lookso/profile/${HACKER_MAN_UP}/following/count`,
      });
      expect(JSON.parse(res.payload).following).to.equal(2);

      const res2 = await fastify.inject({
        method: 'GET',
        url: `/lookso/profile/${UNIVERSAL_PROFILE_2}/following/count`,
      });
      expect(JSON.parse(res2.payload).following).to.equal(0);
    });
  });

  describe('GET /profile/:address/followers/count', () => {
    beforeEach(async () => {
      await clearDB();
      await insertContractInterface('LSP0', '0xid', 'Universal Profile');
      await insertContract(HACKER_MAN_UP, 'LSP0');
      await insertContract(SERIOUS_MAN_UP, 'LSP0');
      await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
      await insertContract(UNIVERSAL_PROFILE_2, 'LSP0');
      await insertFollow(SERIOUS_MAN_UP, HACKER_MAN_UP);
      await insertFollow(UNIVERSAL_PROFILE_1, HACKER_MAN_UP);
    });

    it('should return 200', async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: `/lookso/profile/${HACKER_MAN_UP}/followers/count`,
      });
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right following count', async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: `/lookso/profile/${HACKER_MAN_UP}/followers/count`,
      });
      expect(JSON.parse(res.payload).followers).to.equal(2);

      const res2 = await fastify.inject({
        method: 'GET',
        url: `/lookso/profile/${UNIVERSAL_PROFILE_2}/followers/count`,
      });
      expect(JSON.parse(res2.payload).followers).to.equal(0);
    });
  });
};
