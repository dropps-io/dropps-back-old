import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {insertContractInterface} from "../../../lib/db/queries/contract-interface.table";
import {insertContract} from "../../../lib/db/queries/contract.table";
import {fastify} from "../../../api/fastify";
import {LightMyRequestResponse} from "fastify";
import {expect} from "chai";
import {HACKER_MAN_UP, POST_HASH, SERIOUS_MAN_UP, UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2} from "../../helpers/constants";
import {insertImage} from "../../../lib/db/queries/image.table";
import {insertContractMetadata} from "../../../lib/db/queries/contract-metadata.table";
import {insertNotification, setViewedToAddressNotifications} from "../../../lib/db/queries/notification.table";
import {insertPost} from "../../../lib/db/queries/post.table";
import {API_URL, NOTIFICATIONS_PER_LOAD} from "../../../environment/config";


export const ProfileNotificationsGETTests = () => {

  let res: LightMyRequestResponse;
  let payload: {count: number, next: string | null, previous: string | null, results: any[]};

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
    payload = JSON.parse(res.payload);
  });

  describe('GET lookso/profile/:address/notifications', () => {

    it('should return 200', async () => {
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right amount of notifications', async () => {
      expect(payload.results.length).to.equal(5);
    });

    it('should return the right notifications in chronological order', async () => {
      expect(payload.results[0].sender.address).to.equal(UNIVERSAL_PROFILE_2);
      expect(payload.results[1].sender.address).to.equal(UNIVERSAL_PROFILE_1);
      expect(payload.results[2].sender.address).to.equal(UNIVERSAL_PROFILE_1);
      expect(payload.results[3].sender.address).to.equal(UNIVERSAL_PROFILE_1);
      expect(payload.results[4].sender.address).to.equal(SERIOUS_MAN_UP);
    });

    it('should return the right notifications data', async () => {
      expect(payload.results[0].address).to.equal(HACKER_MAN_UP);
      expect(payload.results[0].sender.address).to.equal(UNIVERSAL_PROFILE_2);
      expect(payload.results[0].sender.image).to.equal('url');
      expect(payload.results[0].sender.name).to.equal('UniversalProfile2');
      expect(payload.results[0].type).to.equal('repost');
      expect(payload.results[0].postHash).to.equal(POST_HASH);

      expect(payload.results[4].address).to.equal(HACKER_MAN_UP);
      expect(payload.results[4].sender.address).to.equal(SERIOUS_MAN_UP);
      expect(payload.results[4].sender.image).to.equal('');
      expect(payload.results[4].sender.name).to.equal('');
      expect(payload.results[4].type).to.equal('follow');
    });

    it('should return the right viewed status', async () => {
      expect(payload.results[0].viewed).to.equal(false);
      expect(payload.results[1].viewed).to.equal(false);
      expect(payload.results[2].viewed).to.equal(false);
      expect(payload.results[3].viewed).to.equal(true);
      expect(payload.results[4].viewed).to.equal(true);
    });

    it('should return 400 on invalid address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}a/notifications`});
      expect(res.statusCode).to.equal(400);
    });

    describe ('With pagination', () => {
      beforeEach(async () => {
        for (let i = 0; i < NOTIFICATIONS_PER_LOAD * 2 - 5; i++) {
          await insertNotification(HACKER_MAN_UP, UNIVERSAL_PROFILE_1, new Date('2022-09-27T12:03:33.089Z'), 'comment', POST_HASH);
        }
      });

      it ('should return the previous page when not in the query', async () => {
        const res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/notifications`});
        payload = JSON.parse(res.payload);
        expect(payload.next).to.be.null;
        expect(payload.previous).to.equal(`${API_URL}/lookso/profile/${HACKER_MAN_UP}/notifications?page=0`);
      });

      it ('should return the right amount of posts', async () => {
        const res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/notifications`});
        payload = JSON.parse(res.payload);
        expect(payload.results.length).to.be.equal(NOTIFICATIONS_PER_LOAD);
      });

      it ('should return the next page', async () => {
        const res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/notifications?page=0`});
        payload = JSON.parse(res.payload);
        expect(payload.previous).to.be.null;
        expect(payload.next).to.equal(`${API_URL}/lookso/profile/${HACKER_MAN_UP}/notifications?page=1`);
      });

      it ('should return only one post on the last page if 61 posts in the feed', async () => {
        await insertNotification(HACKER_MAN_UP, UNIVERSAL_PROFILE_1, new Date('2022-09-27T12:03:33.089Z'), 'comment', POST_HASH);
        const res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/notifications`});
        payload = JSON.parse(res.payload);
        expect(payload.next).to.be.null;
        expect(payload.previous).to.equal(`${API_URL}/lookso/profile/${HACKER_MAN_UP}/notifications?page=1`);
        expect(payload.count).to.equal((NOTIFICATIONS_PER_LOAD  * 2 + 1));
        expect(payload.results.length).to.equal(1);
      });
    });

  });

  describe('GET lookso/profile/:address/notifications/count', () => {

    it('should return 200', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/notifications/count`});
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right unviewed notifications count', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}/notifications/count`});
      expect(JSON.parse(res.payload).notifications).to.equal(3);

      const res2 = await fastify.inject({method: 'GET', url: `/lookso/profile/${UNIVERSAL_PROFILE_2}/notifications/count`});
      expect(JSON.parse(res2.payload).notifications).to.equal(0);
    });

    it('should return 400 on invalid address', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/profile/${HACKER_MAN_UP}a/notifications/count`});
      expect(res.statusCode).to.equal(400);
    });
  });
}