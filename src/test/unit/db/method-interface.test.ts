import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {shouldThrow} from "../../helpers/should-throw";
import {assert, expect} from "chai";
import {insertMethodInterface, queryMethodInterface, queryMethodInterfacesByType} from "../../../lib/db/queries/method-interface.table";


export const MethodInterfaceTests = () => {
  describe('Table Method Interface', () => {

      beforeEach(async () => {
          await clearDB();
      });

      it('should be able to insert values', async () => {
          assert(!await shouldThrow(insertMethodInterface('0x5f6c557f', '0x5f6c557fc82516a035640cdf1be081cd918dca7b19367571f9da46b6e82ccfa2', 'Execute', 'function')));
      });

      it('should be able to query a method interface', async () => {
          await insertMethodInterface('0x5f6c557f', '0x5f6c557fc82516a035640cdf1be081cd918dca7b19367571f9da46b6e82ccfa2', 'Execute', 'function');
          const res = await queryMethodInterface('0x5f6c557f');

          expect(res.id).to.equal('0x5f6c557f');
          expect(res.hash).to.equal('0x5f6c557fc82516a035640cdf1be081cd918dca7b19367571f9da46b6e82ccfa2');
          expect(res.type).to.equal('function');
          expect(res.name).to.equal('Execute');
      });

      it('should be able to query a method interfaces by type', async () => {
          await insertMethodInterface('0x5f6c557f', '0x5f6c557fc82516a035640cdf1be081cd918dca7b19367571f9da46b6e82ccfa2', 'Execute', 'function');
          const functions = await queryMethodInterfacesByType('function');
          const events = await queryMethodInterfacesByType('event');

          expect(functions.length).to.equal(1);
          expect(events.length).to.equal(0);
      });
  });
}