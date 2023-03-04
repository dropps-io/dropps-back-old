import { clearDB } from '../../helpers/database-helper';
import { insertContractInterface } from '../../../lib/db/queries/contract-interface.table';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { fastify } from '../../../api/fastify';
import {
  HACKER_MAN_JWT,
  HACKER_MAN_UP,
  POST_HASH,
  SERIOUS_MAN_JWT,
  SERIOUS_MAN_UP,
  UNIVERSAL_PROFILE_1,
  UNIVERSAL_PROFILE_2,
} from '../../helpers/constants';
import { insertImage } from '../../../lib/db/queries/image.table';
import { insertContractMetadata } from '../../../lib/db/queries/contract-metadata.table';
import {
  insertNotification,
  queryNotificationsOfAddress,
} from '../../../lib/db/queries/notification.table';
import { insertPost } from '../../../lib/db/queries/post.table';

describe('PUT lookso/profile/:address/notifications', () => {
  beforeEach(async () => {
    await clearDB();
    await insertContractInterface('LSP0', '0xid', 'Universal Profile');
    await insertContract(HACKER_MAN_UP, 'LSP0');
    await insertContract(SERIOUS_MAN_UP, 'LSP0');
    await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
    await insertContract(UNIVERSAL_PROFILE_2, 'LSP0');
    await insertContractMetadata(UNIVERSAL_PROFILE_2, 'UniversalProfile2', '', '', false, '');
    await insertImage(UNIVERSAL_PROFILE_2, 'url', 400, 400, 'profile', '');
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
    await insertNotification(
      HACKER_MAN_UP,
      SERIOUS_MAN_UP,
      new Date('2022-09-27T12:03:31.089Z'),
      'follow',
    );
    await insertNotification(
      HACKER_MAN_UP,
      UNIVERSAL_PROFILE_1,
      new Date('2022-09-27T12:03:32.089Z'),
      'follow',
    );
    await insertNotification(
      HACKER_MAN_UP,
      UNIVERSAL_PROFILE_1,
      new Date('2022-09-27T12:03:33.089Z'),
      'comment',
      POST_HASH,
    );
    await insertNotification(
      HACKER_MAN_UP,
      UNIVERSAL_PROFILE_1,
      new Date('2022-09-27T12:03:34.089Z'),
      'like',
      POST_HASH,
    );
    await insertNotification(
      HACKER_MAN_UP,
      UNIVERSAL_PROFILE_2,
      new Date('2022-09-27T12:03:35.089Z'),
      'repost',
      POST_HASH,
    );
  });

  it('should return 200', async () => {
    const res = await fastify.inject({
      method: 'PUT',
      url: `/lookso/profile/${HACKER_MAN_UP}/notifications`,
      headers: {
        authorization: 'Bearer ' + HACKER_MAN_JWT,
      },
    });
    expect(res.statusCode).toEqual(200);
  });

  it('should return the right amount of notifications', async () => {
    await fastify.inject({
      method: 'PUT',
      url: `/lookso/profile/${HACKER_MAN_UP}/notifications`,
      headers: {
        authorization: 'Bearer ' + HACKER_MAN_JWT,
      },
    });
    const notifications = await queryNotificationsOfAddress(HACKER_MAN_UP, 5, 0);
    expect(notifications[0].viewed).toEqual(true);
    expect(notifications[1].viewed).toEqual(true);
    expect(notifications[2].viewed).toEqual(true);
    expect(notifications[3].viewed).toEqual(true);
    expect(notifications[4].viewed).toEqual(true);
  });

  it('should return 400 if invalid address', async () => {
    const res = await fastify.inject({
      method: 'PUT',
      url: `/lookso/profile/${HACKER_MAN_UP}a/notifications`,
      headers: {
        authorization: 'Bearer ' + HACKER_MAN_JWT,
      },
    });
    expect(res.statusCode).toEqual(400);
  });

  it('should return 403 if invalid JWT', async () => {
    const res = await fastify.inject({
      method: 'PUT',
      url: `/lookso/profile/${HACKER_MAN_UP}/notifications`,
      headers: {
        authorization: 'Bearer ' + SERIOUS_MAN_JWT,
      },
    });
    expect(res.statusCode).toEqual(403);
  });
});
