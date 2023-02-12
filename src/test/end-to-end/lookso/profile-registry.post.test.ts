import { describe } from 'mocha';
import { expect } from 'chai';

import { clearDB } from '../../helpers/database-helper';
import { insertContractInterface } from '../../../lib/db/queries/contract-interface.table';
import { insertContract } from '../../../lib/db/queries/contract.table';
import {
  HACKER_MAN_JWT,
  HACKER_MAN_UP,
  POST_HASH,
  POST_HASH2,
  SERIOUS_MAN_UP,
  UNIT_TEST_UP,
  UNIT_TEST_UP_JWT,
  UNIVERSAL_PROFILE_1,
} from '../../helpers/constants';
import { fastify } from '../../../api/fastify';
import { insertLike, querySenderLikes } from '../../../lib/db/queries/like.table';
import { insertPost } from '../../../lib/db/queries/post.table';
import { insertFollow, queryFollowing } from '../../../lib/db/queries/follow.table';
import {
  insertRegistryChange,
  queryRegistryChangesOfAddress,
} from '../../../lib/db/queries/registry-change.table';

export const ProfileRegistryPOSTTests = () => {
  describe('POST lookso/profile/:address/registry', () => {
    beforeEach(async () => {
      await clearDB();
      await insertContractInterface('LSP0', '0xid', 'Universal Profile');
      await insertContract(UNIT_TEST_UP, 'LSP0');
    });

    it('should return 200 on correct request', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: `/lookso/profile/${UNIT_TEST_UP}/registry`,
        headers: {
          authorization: 'Bearer ' + UNIT_TEST_UP_JWT,
        },
      });
      expect(res.statusCode).to.equal(200);
    });

    it('should return a jsonUrl on correct request', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: `/lookso/profile/${UNIT_TEST_UP}/registry`,
        headers: {
          authorization: 'Bearer ' + UNIT_TEST_UP_JWT,
        },
      });
      expect(JSON.parse(res.payload).jsonUrl).to.not.undefined;
    });

    it('should correctly update the database', async () => {
      await insertContract(HACKER_MAN_UP, 'LSP0');
      await insertContract(SERIOUS_MAN_UP, 'LSP0');
      await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
      await insertPost(
        POST_HASH,
        HACKER_MAN_UP,
        new Date('2022-09-27T12:03:31.089Z'),
        'test',
        '',
        null,
        null,
        null,
      );
      await insertPost(
        POST_HASH2,
        HACKER_MAN_UP,
        new Date('2022-09-27T12:03:31.089Z'),
        'test',
        '',
        null,
        null,
        null,
      );
      await insertLike(UNIT_TEST_UP, POST_HASH);
      await insertFollow(UNIT_TEST_UP, HACKER_MAN_UP);
      await insertFollow(UNIT_TEST_UP, SERIOUS_MAN_UP);
      await insertRegistryChange(UNIT_TEST_UP, 'like', 'remove', POST_HASH, new Date());
      await insertRegistryChange(UNIT_TEST_UP, 'like', 'add', POST_HASH2, new Date());
      await insertRegistryChange(UNIT_TEST_UP, 'follow', 'remove', SERIOUS_MAN_UP, new Date());
      await insertRegistryChange(UNIT_TEST_UP, 'follow', 'add', UNIVERSAL_PROFILE_1, new Date());
      await fastify.inject({
        method: 'POST',
        url: `/lookso/profile/${UNIT_TEST_UP}/registry`,
        headers: {
          authorization: 'Bearer ' + UNIT_TEST_UP_JWT,
        },
      });

      const likes = await querySenderLikes(UNIT_TEST_UP);
      const follows = await queryFollowing(UNIT_TEST_UP);

      expect(likes).to.contain(POST_HASH2);
      expect(likes).to.not.contain(POST_HASH);
      expect(follows).to.not.contain(HACKER_MAN_UP);
      expect(follows).to.contain(UNIVERSAL_PROFILE_1);
      expect(follows).to.not.contain(SERIOUS_MAN_UP);
    });

    it('should return 400 if invalid address', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: `/lookso/profile/${UNIT_TEST_UP}a/registry`,
        headers: {
          authorization: 'Bearer ' + UNIT_TEST_UP_JWT,
        },
      });
      expect(res.statusCode).to.equal(400);
    });

    it('should return 403 if invalid JWT', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: `/lookso/profile/${UNIT_TEST_UP}/registry`,
        headers: {
          authorization: 'Bearer ' + HACKER_MAN_JWT,
        },
      });
      expect(res.statusCode).to.equal(403);
    });
  });

  describe('POST lookso/profile/:address/registry/uploaded', () => {
    beforeEach(async () => {
      await clearDB();
      await insertContractInterface('LSP0', '0xid', 'Universal Profile');
      await insertContract(UNIT_TEST_UP, 'LSP0');
    });

    it('should return 200 on correct request', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: `/lookso/profile/${UNIT_TEST_UP}/registry/uploaded`,
        headers: {
          authorization: 'Bearer ' + UNIT_TEST_UP_JWT,
        },
      });
      expect(res.statusCode).to.equal(200);
    });

    it('should correctly update the database', async () => {
      await insertContract(HACKER_MAN_UP, 'LSP0');
      await insertContract(SERIOUS_MAN_UP, 'LSP0');
      await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
      await insertRegistryChange(UNIT_TEST_UP, 'like', 'remove', POST_HASH, new Date());
      await insertRegistryChange(UNIT_TEST_UP, 'like', 'add', POST_HASH2, new Date());
      await insertRegistryChange(UNIT_TEST_UP, 'follow', 'remove', SERIOUS_MAN_UP, new Date());
      await insertRegistryChange(UNIT_TEST_UP, 'follow', 'add', UNIVERSAL_PROFILE_1, new Date());
      await fastify.inject({
        method: 'POST',
        url: `/lookso/profile/${UNIT_TEST_UP}/registry/uploaded`,
        headers: {
          authorization: 'Bearer ' + UNIT_TEST_UP_JWT,
        },
      });

      const changes = await queryRegistryChangesOfAddress(UNIT_TEST_UP);
      expect(changes.length).to.equal(0);
    });

    it('should return 400 if invalid address', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: `/lookso/profile/${UNIT_TEST_UP}a/registry/uploaded`,
        headers: {
          authorization: 'Bearer ' + UNIT_TEST_UP_JWT,
        },
      });
      expect(res.statusCode).to.equal(400);
    });

    it('should return 403 if invalid JWT', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: `/lookso/profile/${UNIT_TEST_UP}/registry/uploaded`,
        headers: {
          authorization: 'Bearer ' + HACKER_MAN_JWT,
        },
      });
      expect(res.statusCode).to.equal(403);
    });
  });
};
