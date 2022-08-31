import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {shouldThrow} from "../../helpers/should-throw";
import {assert, expect} from "chai";
import {UNIVERSAL_PROFILE_1} from "../../helpers/constants";
import {insertDecodedFunctionParameter, queryDecodedFunctionParameters} from "../../../bin/db/decoded-function-parameter.table";
import {insertContract} from "../../../bin/db/contract.table";
import {insertTransaction} from "../../../bin/db/transaction.table";


export const DecodedFunctionParametersTests = () => {
  describe('Table Decoded Function Parameter', () => {

      beforeEach(async () => {
          await clearDB();
          await insertContract(UNIVERSAL_PROFILE_1, null);
          await insertTransaction(
              '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9822',
              '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
              '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
              '0',
              '0x6cf76a6d00000000000000000000ed55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
              0
          );
      });

      it('should be able to insert values', async () => {
          assert(!await shouldThrow(insertDecodedFunctionParameter('0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9822', 'SuperValue', 'key', 'string')));
      });

      it('should be able to insert values with displayType', async () => {
          assert(!await shouldThrow(insertDecodedFunctionParameter('0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9822', 'SuperValue', 'key', 'string', 'display')));
      });

        it('should be able to query decoded parameters', async () => {
            await insertDecodedFunctionParameter('0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9822', 'SuperValue', 'key', 'string');
            const decodedParameters = await queryDecodedFunctionParameters('0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9822');

            expect(decodedParameters[0].value).to.equal('SuperValue');
            expect(decodedParameters[0].name).to.equal('key');
            expect(decodedParameters[0].type).to.equal('string');
        });
  });
}