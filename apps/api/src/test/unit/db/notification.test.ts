import { clearDB } from '../../helpers/database-helper';
import { UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2 } from '../../helpers/constants';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { shouldThrow } from '../../helpers/should-throw';
import {
  insertNotification,
  queryNotificationsCountOfAddress,
  queryNotificationsOfAddress,
  setViewedToAddressNotifications,
} from '../../../lib/db/queries/notification.table';
import { insertPost } from '../../../lib/db/queries/post.table';

describe('Table NotificationTable', () => {
  beforeEach(async () => {
    await clearDB();
    await insertContract(UNIVERSAL_PROFILE_1, null);
    await insertContract(UNIVERSAL_PROFILE_2, null);
    await insertPost(
      '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
      UNIVERSAL_PROFILE_1,
      new Date(),
      'Text',
      'url',
      null,
      null,
      null,
    );
  });

  it('should be able to insert values', async () => {
    expect(
      !(await shouldThrow(
        insertNotification(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, new Date(), 'like'),
      )),
    ).toBe(true);
  });

  it('should be able to insert values with post hash', async () => {
    expect(
      !(await shouldThrow(
        insertNotification(
          UNIVERSAL_PROFILE_1,
          UNIVERSAL_PROFILE_2,
          new Date(),
          'like',
          '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
        ),
      )),
    ).toBe(true);
  });

  it('should no be able to insert values with unknown post hash', async () => {
    expect(
      await shouldThrow(
        insertNotification(
          UNIVERSAL_PROFILE_1,
          UNIVERSAL_PROFILE_2,
          new Date(),
          'like',
          '0xb097d7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435dawhdba',
        ),
      ),
    ).toBe(true);
  });

  it('should no be able to insert values with unknown address', async () => {
    expect(
      await shouldThrow(
        insertNotification('0x00000000000000000000', UNIVERSAL_PROFILE_2, new Date(), 'like'),
      ),
    ).toBe(true);
  });

  it('should no be able to insert values with unknown sender', async () => {
    expect(
      await shouldThrow(
        insertNotification(UNIVERSAL_PROFILE_2, '0x00000000000000000000', new Date(), 'like'),
      ),
    ).toBe(true);
  });

  it('should be able to query address notifications', async () => {
    await insertNotification(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, new Date(), 'like');
    await insertNotification(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, new Date(), 'like');
    await insertNotification(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, new Date(), 'like');
    await insertNotification(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, new Date(), 'like');
    const res = await queryNotificationsOfAddress(UNIVERSAL_PROFILE_1, 30, 0);

    expect(res.length).toEqual(4);
  });

  it('should be able to query address notifications count', async () => {
    await insertNotification(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, new Date(), 'like');
    await insertNotification(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, new Date(), 'like');
    await insertNotification(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, new Date(), 'like');
    await insertNotification(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, new Date(), 'like');
    const res = await queryNotificationsCountOfAddress(UNIVERSAL_PROFILE_1);

    expect(res).toEqual(4);
  });

  it('should be able to set all notifications to viewed', async () => {
    await insertNotification(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, new Date(), 'like');
    await insertNotification(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, new Date(), 'like');
    await insertNotification(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, new Date(), 'like');
    await insertNotification(UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2, new Date(), 'like');
    await setViewedToAddressNotifications(UNIVERSAL_PROFILE_1);
    const res = await queryNotificationsOfAddress(UNIVERSAL_PROFILE_1, 30, 0);

    expect(res.every((n) => n.viewed)).toBe(true);
  });
});
