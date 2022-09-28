import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {insertContractInterface} from "../../../bin/db/contract-interface.table";
import {insertContract} from "../../../bin/db/contract.table";
import {HACKER_MAN_UP, SERIOUS_MAN_UP, UNIT_TEST_UP, UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2} from "../../helpers/constants";

export const ProfileRegistryPOSTTests = () => {

  describe('POST lookso/profile/:address/registry', () => {

    beforeEach(async () => {
      await clearDB();
      await insertContractInterface('LSP0', '0xid', 'Universal Profile');
      await insertContract(UNIT_TEST_UP, 'LSP0');
    });


  });
}