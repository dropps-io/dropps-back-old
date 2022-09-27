import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {insertContractInterface} from "../../../bin/db/contract-interface.table";
import {insertContract} from "../../../bin/db/contract.table";
import {fastify} from "../../../lib/fastify";
import {LightMyRequestResponse} from "fastify";
import {expect} from "chai";
import {HACKER_MAN_UP, POST_HASH, SERIOUS_MAN_UP, UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2} from "../../helpers/constants";
import {insertImage} from "../../../bin/db/image.table";
import {insertContractMetadata} from "../../../bin/db/contract-metadata.table";
import {insertNotification, setViewedToAddressNotifications} from "../../../bin/db/notification.table";
import {insertPost} from "../../../bin/db/post.table";


export const ProfileNotificationsGETTests = () => {

  let res: LightMyRequestResponse;
  let notifications: any[];

  beforeEach(async () => {
    await clearDB();
    await insertContractInterface('LSP0', '0xid', 'Universal Profile');
    await insertContract(HACKER_MAN_UP, 'LSP0');
    await insertContract(SERIOUS_MAN_UP, 'LSP0');
    await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
    await insertContract(UNIVERSAL_PROFILE_2, 'LSP0');
    await insertContractMetadata(UNIVERSAL_PROFILE_2, 'UniversalProfile2', '', '', false, '');
    await insertImage(UNIVERSAL_PROFILE_2, 'url', 400, 400, 'profile', '');
    await insertPost(POST_HASH, HACKER_MAN_UP, new Date('2022-09-27T12:03:31.089Z'), 'test', '', null, null, null);
    await insertNotification(HACKER_MAN_UP, SERIOUS_MAN_UP, new Date('2022-09-27T12:03:31.089Z'), 'follow');
    await insertNotification(HACKER_MAN_UP, UNIVERSAL_PROFILE_1, new Date('2022-09-27T12:03:32.089Z'), 'follow');
    await setViewedToAddressNotifications(HACKER_MAN_UP);
    await insertNotification(HACKER_MAN_UP, UNIVERSAL_PROFILE_1, new Date('2022-09-27T12:03:33.089Z'), 'comment', POST_HASH);
    await insertNotification(HACKER_MAN_UP, UNIVERSAL_PROFILE_1, new Date('2022-09-27T12:03:34.089Z'), 'like', POST_HASH);
    await insertNotification(HACKER_MAN_UP, UNIVERSAL_PROFILE_2, new Date('2022-09-27T12:03:35.089Z'), 'repost', POST_HASH);

    res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/notifications`});
    notifications = JSON.parse(res.payload);
  });

  describe('GET lookso/profile/:address/notifications', () => {

    it('should return 200', async () => {
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right amount of notifications', async () => {
      expect(notifications.length).to.equal(5);
    });

    it('should return the right notifications in chronological order', async () => {
      expect(notifications[0].sender.address).to.equal(UNIVERSAL_PROFILE_2);
      expect(notifications[1].sender.address).to.equal(UNIVERSAL_PROFILE_1);
      expect(notifications[2].sender.address).to.equal(UNIVERSAL_PROFILE_1);
      expect(notifications[3].sender.address).to.equal(UNIVERSAL_PROFILE_1);
      expect(notifications[4].sender.address).to.equal(SERIOUS_MAN_UP);
    });

    it('should return the right notifications data', async () => {
      expect(notifications[0].address).to.equal(HACKER_MAN_UP);
      expect(notifications[0].sender.address).to.equal(UNIVERSAL_PROFILE_2);
      expect(notifications[0].sender.image).to.equal('url');
      expect(notifications[0].sender.name).to.equal('UniversalProfile2');
      expect(notifications[0].type).to.equal('repost');
      expect(notifications[0].postHash).to.equal(POST_HASH);

      expect(notifications[4].address).to.equal(HACKER_MAN_UP);
      expect(notifications[4].sender.address).to.equal(SERIOUS_MAN_UP);
      expect(notifications[4].sender.image).to.equal('');
      expect(notifications[4].sender.name).to.equal('');
      expect(notifications[4].type).to.equal('follow');
    });

    it('should return the right viewed status', async () => {
      expect(notifications[0].viewed).to.equal(false);
      expect(notifications[1].viewed).to.equal(false);
      expect(notifications[2].viewed).to.equal(false);
      expect(notifications[3].viewed).to.equal(true);
      expect(notifications[4].viewed).to.equal(true);
    });

    it('should work with offset', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/notifications?offset=2`});
      notifications = JSON.parse(res.payload);
      expect(notifications.length).to.equal(3);
    });

    it('should work with limit', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/notifications?limit=2`});
      notifications = JSON.parse(res.payload);
      expect(notifications.length).to.equal(2);
    });

  });

  describe('GET lookso/profile/:address/notifications/count', () => {

    it('should return 200', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/notifications/count`});
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right unviewed notifications count', async () => {
      const res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/notifications/count`});
      expect(JSON.parse(res.payload).notifications).to.equal(3);

      const res2 = await fastify.inject({method: 'GET', url: `/lookso/profile/${UNIVERSAL_PROFILE_2}/notifications/count`});
      expect(JSON.parse(res2.payload).notifications).to.equal(0);
    });

  });
}