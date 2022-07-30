import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {assert, expect} from "chai";
import {shouldThrow} from "../../helpers/should-throw";
import {insertPost, queryPost} from "../../../bin/db/post.table";
import {UNIVERSAL_PROFILE_1} from "../../helpers/constants";
import {insertContract} from "../../../bin/db/contract.table";
import {insertEvent, queryEvent} from "../../../bin/db/event.table";

export const PostTests = () => {
  describe('Table Post', () => {

      beforeEach(async () => {
          await clearDB();
          await insertContract(UNIVERSAL_PROFILE_1, null);
      });

      it ('should be able to insert values', async () => {
          assert(!await shouldThrow(
              insertPost(
                  '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
                  UNIVERSAL_PROFILE_1,
                  new Date(),
                  'Text',
                  'url',
                  null,
                  null,
                  null
              )));
      });

      it('should be able to insert values with parentHash referring to a post', async () => {
          insertPost(
              '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
              UNIVERSAL_PROFILE_1,
              new Date(),
              'Text',
              'url',
              null,
              null,
              null
          );

          assert(!await shouldThrow(
              insertPost(
                  '0xb097de0f7a884906c66qw0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
                  UNIVERSAL_PROFILE_1,
                  new Date(),
                  'Text',
                  'url',
                  '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
                  null,
                  null
              )));
      });

      it('should be able to insert values with childHash referring to a post', async () => {
          await insertPost(
              '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
              UNIVERSAL_PROFILE_1,
              new Date(),
              'Text',
              'url',
              null,
              null,
              null
          );

          assert(!await shouldThrow(
              insertPost(
                  '0xb097de0f7a884906c66qw0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
                  UNIVERSAL_PROFILE_1,
                  new Date(),
                  'Text',
                  'url',
                  null,
                  '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
                  null
              )));
      });

      it('should be able to insert values with eventId referring to an event', async () => {
          const id = await insertEvent(UNIVERSAL_PROFILE_1, '', '', 0, '', '');

          assert(!await shouldThrow(
              insertPost(
                  '0xb097de0f7a884906c66qw0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
                  UNIVERSAL_PROFILE_1,
                  new Date(),
                  'Text',
                  'url',
                  null,
                  null,
                  id
              )));
      });

      it('should not be able to insert values with parentHash not referring to a post', async () => {
          assert(await shouldThrow(
              insertPost(
                  '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
                  UNIVERSAL_PROFILE_1,
                  new Date(),
                  'Text',
                  'url',
                  '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd13asd2435428',
                  null,
                  null
              )));
      });

      it('should not be able to insert values with childHash not referring to a post', async () => {
          assert(await shouldThrow(
              insertPost(
                  '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
                  UNIVERSAL_PROFILE_1,
                  new Date(),
                  'Text',
                  'url',
                  null,
                  '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd13asd2435428',
                  null
              )));
      });

      it('should not be able to insert values with eventId not referring to a post', async () => {
          assert(await shouldThrow(
              insertPost(
                  '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
                  UNIVERSAL_PROFILE_1,
                  new Date(),
                  'Text',
                  'url',
                  null,
                  null,
                  2
              )));
      });

      it('should be able to query values with postHash', async () => {
          const date: Date = new Date(Date.now())
          await insertPost(
              '0xb097de0f7a884906c66qw0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
              UNIVERSAL_PROFILE_1,
              date,
              'Text',
              'url',
              null,
              null,
              null
          );

          const post = await queryPost('0xb097de0f7a884906c66qw0c5f42d8a27ae841af2fa68a05343cd1333d2435428');

          expect(post.hash).to.be.equal('0xb097de0f7a884906c66qw0c5f42d8a27ae841af2fa68a05343cd1333d2435428');
          expect(post.author).to.be.equal(UNIVERSAL_PROFILE_1);
          expect(post.date.toDateString()).to.be.equal(date.toDateString());
          expect(post.text).to.be.equal('Text');
          expect(post.mediaUrl).to.be.equal('url');
      });
  });
}