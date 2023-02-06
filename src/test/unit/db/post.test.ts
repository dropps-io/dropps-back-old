import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {assert, expect} from "chai";
import {shouldThrow} from "../../helpers/should-throw";
import {insertPost, queryPost} from "../../../lib/db/queries/post.table";
import {UNIVERSAL_PROFILE_1} from "../../helpers/constants";
import {insertContract} from "../../../lib/db/queries/contract.table";
import {insertEvent} from "../../../lib/db/queries/event.table";
import {insertTransaction} from "../../../lib/db/queries/transaction.table";

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
          await insertTransaction(
              '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9832',
              '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
              '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
              '0',
              '0x6cf76a6d00000000000000000000ed55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
              0
          );

          const id = await insertEvent(UNIVERSAL_PROFILE_1, '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9832', '', 0, '', '');

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

      it('should be able to insert values with transactionHash and/or inRegistry', async () => {
          assert(!await shouldThrow(
            insertPost(
              '0xb097de0f7a884906c66qw0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
              UNIVERSAL_PROFILE_1,
              new Date(),
              'Text',
              'url',
              null,
              null,
              null,
              false,
              '0x00000000000000000000000000000'
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