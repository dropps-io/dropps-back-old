import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {assert, expect} from "chai";
import {UNIVERSAL_PROFILE_1} from "../../helpers/constants";
import {insertContract, queryContract, updateContract} from "../../../bin/db/contract.table";
import {shouldThrow} from "../../helpers/should-throw";
import {insertContractInterface} from "../../../bin/db/contract-interface.table";

export const ContractTests = () => {
  describe('Table ContractTable', () => {

      beforeEach(async () => {
          await clearDB();
          await insertContractInterface('LSP0', '0x12345678', 'Universal Profile');
      });

      it ('should be able to insert values', async () => {
          assert(!await shouldThrow(insertContract(UNIVERSAL_PROFILE_1, 'LSP0')));
      });

      it ('should be able to query values', async () => {
          await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
          const res = await queryContract(UNIVERSAL_PROFILE_1);

          expect(res.address).to.be.equal(UNIVERSAL_PROFILE_1);
          expect(res.interfaceCode).to.be.equal('LSP0');
      });

      it ('should be able to update values', async () => {
          await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
          await updateContract(UNIVERSAL_PROFILE_1, null);
          const res = await queryContract(UNIVERSAL_PROFILE_1);

          expect(res.address).to.be.equal(UNIVERSAL_PROFILE_1);
          expect(res.interfaceCode).to.be.equal(null);
      });
  });
}