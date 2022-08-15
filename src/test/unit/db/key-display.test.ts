import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {shouldThrow} from "../../helpers/should-throw";
import {assert, expect} from "chai";
import {insertKeyDisplay, queryKeyDisplay} from "../../../bin/db/key-display.table";


export const KeyDisplayTests = () => {
  describe('Table Key Display', () => {

      beforeEach(async () => {
          await clearDB();
      });

      it('should be able to insert values', async () => {
          assert(!await shouldThrow(insertKeyDisplay('0x5f6c557f', 'text', 'text2')));
      });

      it('should be able to query a key display', async () => {
          await insertKeyDisplay('0x5f6c557f', 'text', 'text2');
          const res = await queryKeyDisplay('0x5f6c557f');

          expect(res.display).to.equal('text');
          expect(res.displayWithoutValue).to.equal('text2');
      });

  });
}