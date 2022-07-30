import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {assert, expect} from "chai";
import {shouldThrow} from "../../helpers/should-throw";
import {insertPost, queryPost} from "../../../bin/db/post.table";
import {UNIVERSAL_PROFILE_1} from "../../helpers/constants";
import {insertContract} from "../../../bin/db/contract.table";
import {insertEvent, queryEvent, updateEvent} from "../../../bin/db/event.table";

export const EventTests = () => {
  describe('Table Event', () => {

      beforeEach(async () => {
          await clearDB();
          await insertContract(UNIVERSAL_PROFILE_1, null);
      });

      it ('should be able to insert event', async () => {
          assert(!await shouldThrow(
              insertEvent(
                  UNIVERSAL_PROFILE_1,
                  '',
                  '',
                  0,
                  '',
                  ''
              )));
      });

      it ('should be able to query event', async () => {
          const id = await insertEvent(
              UNIVERSAL_PROFILE_1,
              '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
              '01234567',
              0,
              '0x5f6c557fc82516a035640cdf1be081cd918dca7b19367571f9da46b6e82ccfa2',
              'ty'
          );

          const event = await queryEvent(id);
          expect(event.address).to.equal(UNIVERSAL_PROFILE_1);
          expect(event.type).to.equal('ty');
          expect(event.transactionHash).to.equal('0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428');
          expect(event.logId).to.equal('01234567');
          expect(event.blockNumber).to.equal(0);
          expect(event.topic).to.equal('0x5f6c557fc82516a035640cdf1be081cd918dca7b19367571f9da46b6e82ccfa2');
      });

      it ('should be able to update event', async () => {
          const id = await insertEvent(
              UNIVERSAL_PROFILE_1,
              '0xb097de0f7a884906c66ef0c5f42d8a27ae841af2fa68a05343cd1333d2435428',
              '01234567',
              0,
              '0x5f6c557fc82516a035640cdf1be081cd918dca7b19367571f9da46b6e82ccfa2',
              'ty'
          );
          await updateEvent(id, 'Executed');

          const event = await queryEvent(id);
          expect(event.type).to.equal('Executed');
      });
  });
}