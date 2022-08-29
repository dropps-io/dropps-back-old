import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {shouldThrow} from "../../helpers/should-throw";
import {assert, expect} from "chai";
import {insertContractInterface, queryContractInterface, queryContractInterfaces, updateContractInterface} from "../../../bin/db/contract-interface.table";


export const ContractInterfaceTests = () => {
  describe('Table Contract Interface', () => {

      beforeEach(async () => {
          await clearDB();
      });

      it('should be able to insert values', async () => {
          assert(!await shouldThrow(insertContractInterface('LSP0', '0x12345678', 'Universal Profile')));
      });

      it('should be able to query specific values', async () => {
          await insertContractInterface('LSP0', '0x12345678', 'Universal Profile');
          const res = await queryContractInterface('LSP0');

          expect(res.id).to.equal('0x12345678');
          expect(res.code).to.equal('LSP0');
          expect(res.name).to.equal('Universal Profile');
      });

      it('should be able to query values', async () => {
          await insertContractInterface('LSP0', '0x12345678', 'Universal Profile');
          const res = await queryContractInterfaces();

          expect(res[0].id).to.equal('0x12345678');
          expect(res[0].code).to.equal('LSP0');
          expect(res[0].name).to.equal('Universal Profile');
      });

      it('should be able to update values', async () => {
          await insertContractInterface('LSP0', '0x12345678', 'Universal Profile');
          await updateContractInterface('0x12345678', 'Profile');
          const res = await queryContractInterface('LSP0');

          expect(res.name).to.equal('Profile');
      });
  });
}