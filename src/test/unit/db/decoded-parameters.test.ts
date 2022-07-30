import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {shouldThrow} from "../../helpers/should-throw";
import {assert, expect} from "chai";
import {insertEvent} from "../../../bin/db/event.table";
import {UNIVERSAL_PROFILE_1} from "../../helpers/constants";
import {insertDecodedParameter, queryDecodedParameters} from "../../../bin/db/decoded-parameter.table";
import {insertContract} from "../../../bin/db/contract.table";


export const DecodedParametersTests = () => {
  describe('Table Decoded Parameters', () => {
      let id: number;

      beforeEach(async () => {
          await clearDB();
          await insertContract(UNIVERSAL_PROFILE_1, null);
          id = await insertEvent(UNIVERSAL_PROFILE_1, '', '', 0, '', '');
      });

      it('should be able to insert values', async () => {
          assert(!await shouldThrow(insertDecodedParameter(id, 'SuperValue', 'key', 'string')));
      });

        it('should be able to query decoded parameters', async () => {
            await insertDecodedParameter(id, 'SuperValue', 'key', 'string');
            const decodedParameters = await queryDecodedParameters(id);

            expect(decodedParameters[0].value).to.equal('SuperValue');
            expect(decodedParameters[0].eventId).to.equal(id);
            expect(decodedParameters[0].name).to.equal('key');
            expect(decodedParameters[0].type).to.equal('string');
        });
  });
}