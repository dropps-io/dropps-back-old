import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {shouldThrow} from "../../helpers/should-throw";
import {assert, expect} from "chai";
import {insertErc725ySchema, queryErc725ySchema} from "../../../bin/db/erc725y-schema.table";


export const Erc725ySchemaTests = () => {
  describe('Table Key Display', () => {

      beforeEach(async () => {
          await clearDB();
      });

      it('should be able to insert values', async () => {
          assert(!await shouldThrow(insertErc725ySchema('0xdc780d75098db5d742b3667921413268882f3a5f26ae580ac9ad86443809ca23', 'text', 'text2', 'text3', 'text4')));
      });

      it('should be able to query a key display', async () => {
          await insertErc725ySchema('0xdc780d75098db5d742b3667921413268882f3a5f26ae580ac9ad86443809ca23', 'text', 'text2', 'text3', 'text4');
          const res = await queryErc725ySchema('0xdc780d75098db5d742b3667921413268882f3a5f26ae580ac9ad86443809ca23');

          expect(res.key).to.equal('0xdc780d75098db5d742b3667921413268882f3a5f26ae580ac9ad86443809ca23');
          expect(res.name).to.equal('text');
          expect(res.keyType).to.equal('text2');
          expect(res.valueType).to.equal('text3');
          expect(res.valueContent).to.equal('text4');
      });

  });
}