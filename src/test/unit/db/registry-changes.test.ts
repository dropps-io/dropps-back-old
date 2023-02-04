import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {assert, expect} from "chai";
import {UNIVERSAL_PROFILE_1} from "../../helpers/constants";
import {insertContract} from "../../../lib/db/queries/contract.table";
import {shouldThrow} from "../../helpers/should-throw";
import {
    deleteAddressRegistryChanges, insertRegistryChange, queryRegistryChangesCountOfAddress, queryRegistryChangesOfAddress,
} from "../../../lib/db/queries/registry-change.table";

export const RegistryChangeTests = () => {
  describe('Table RegistryChangeTable', () => {

      beforeEach(async () => {
          await clearDB();
          await insertContract(UNIVERSAL_PROFILE_1, null);
      });

      it ('should be able to insert values', async () => {
          assert(!await shouldThrow(insertRegistryChange(UNIVERSAL_PROFILE_1, 'like', 'add', '0x000', new Date())));
      });

      it ('should be able to query address registry changes', async () => {
          await insertRegistryChange(UNIVERSAL_PROFILE_1, 'like', 'add', '0x000', new Date())
          await insertRegistryChange(UNIVERSAL_PROFILE_1, 'like', 'add', '0x001', new Date())
          await insertRegistryChange(UNIVERSAL_PROFILE_1, 'like', 'add', '0x002', new Date())
          await insertRegistryChange(UNIVERSAL_PROFILE_1, 'like', 'add', '0x003', new Date())
          const res = await queryRegistryChangesOfAddress(UNIVERSAL_PROFILE_1);

          expect(res.length).to.be.equal(4);
      });

      it ('should be able to query address registry changes count', async () => {
          await insertRegistryChange(UNIVERSAL_PROFILE_1, 'like', 'add', '0x000', new Date())
          await insertRegistryChange(UNIVERSAL_PROFILE_1, 'like', 'add', '0x001', new Date())
          await insertRegistryChange(UNIVERSAL_PROFILE_1, 'like', 'add', '0x002', new Date())
          await insertRegistryChange(UNIVERSAL_PROFILE_1, 'like', 'add', '0x003', new Date())
          const res = await queryRegistryChangesCountOfAddress(UNIVERSAL_PROFILE_1);

          expect(res).to.be.equal(4);
      });

      it ('should be able to delete all registry changes of user', async () => {
          await insertRegistryChange(UNIVERSAL_PROFILE_1, 'like', 'add', '0x000', new Date())
          await insertRegistryChange(UNIVERSAL_PROFILE_1, 'like', 'add', '0x001', new Date())
          await insertRegistryChange(UNIVERSAL_PROFILE_1, 'like', 'add', '0x002', new Date())
          await insertRegistryChange(UNIVERSAL_PROFILE_1, 'like', 'add', '0x003', new Date())
          await deleteAddressRegistryChanges(UNIVERSAL_PROFILE_1);
          const res = await queryRegistryChangesCountOfAddress(UNIVERSAL_PROFILE_1);

          expect(res).to.be.equal(0);
      });
  });
}