import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {shouldThrow} from "../../helpers/should-throw";
import {assert, expect} from "chai";
import {insertContract} from "../../../bin/db/contract.table";
import {UNIVERSAL_PROFILE_1} from "../../helpers/constants";
import {
    insertContractMetadata, queryContractMetadata, updateContractDescription, updateContractName, updateContractSupply, updateContractSymbol
} from "../../../bin/db/contract-metadata.table";


export const ContractMetadataTests = () => {
  describe('Table Contract Metadata', () => {

      beforeEach(async () => {
          await clearDB();
          await insertContract(UNIVERSAL_PROFILE_1, null);
      });

      it('should be able to insert values', async () => {
          assert(!await shouldThrow(insertContractMetadata(UNIVERSAL_PROFILE_1, 'My Profile', 'MP', 'My Description', false, '0')));
      });

      it('should be able to query values', async () => {
          await insertContractMetadata(UNIVERSAL_PROFILE_1, 'My Profile', 'MP', 'My Description', false, '0');
          const res = await queryContractMetadata(UNIVERSAL_PROFILE_1);

          expect(res.address).to.equal(UNIVERSAL_PROFILE_1);
          expect(res.name).to.equal('My Profile');
          expect(res.symbol).to.equal('MP');
          expect(res.description).to.equal('My Description');
      });

      it('should be able to update values', async () => {
          await insertContractMetadata(UNIVERSAL_PROFILE_1, 'My Profile', 'MP', 'My Description', false, '0');
          await updateContractSymbol(UNIVERSAL_PROFILE_1, 'P');
          await updateContractDescription(UNIVERSAL_PROFILE_1, 'Description');
          await updateContractSupply(UNIVERSAL_PROFILE_1, '1');
          await updateContractName(UNIVERSAL_PROFILE_1, 'Profile');
          const res = await queryContractMetadata(UNIVERSAL_PROFILE_1);

          expect(res.address).to.equal(UNIVERSAL_PROFILE_1);
          expect(res.name).to.equal('Profile');
          expect(res.symbol).to.equal('P');
          expect(res.description).to.equal('Description');
          expect(res.supply).to.equal('1');
      });
  });
}