import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {shouldThrow} from "../../helpers/should-throw";
import {assert, expect} from "chai";
import {insertMethodDisplay, queryMethodDisplay} from "../../../bin/db/method-display.table";
import {insertMethodInterface} from "../../../bin/db/method-interface.table";


export const MethodDisplayTests = () => {
  describe('Table Method Display', () => {

      beforeEach(async () => {
          await clearDB();
          await insertMethodInterface('0x5f6c557f', '0x5f6c557fc82516a035640cdf1be081cd918dca7b19367571f9da46b6e82ccfa2', 'Execute', 'function');
      });

      it('should be able to insert values', async () => {
          assert(!await shouldThrow(insertMethodDisplay('0x5f6c557f', 'text', 'image', 'copies', 'standard')));
      });

      it('should not be able to insert values if no method interface linked', async () => {
          assert(await shouldThrow(insertMethodDisplay('0x4f6c557f', 'text', 'image', 'copies', 'standard')));
      });

      it('should be able to query a method display', async () => {
          await insertMethodDisplay('0x5f6c557f', 'text', 'image', 'copies', 'standard');
          const res = await queryMethodDisplay('0x5f6c557f');

          expect(res.methodId).to.equal('0x5f6c557f');
          expect(res.text).to.equal('text');
          expect(res.imageFrom).to.equal('image');
          expect(res.copiesFrom).to.equal('copies');
          expect(res.standardFrom).to.equal('standard');
      });

  });
}