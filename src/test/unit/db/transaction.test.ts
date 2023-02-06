import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {assert, expect} from "chai";
import {shouldThrow} from "../../helpers/should-throw";
import {insertTransaction, queryTransaction} from "../../../lib/db/queries/transaction.table";

export const TransactionTests = () => {
  describe('Table Transaction', () => {

      beforeEach(async () => {
          await clearDB();
      });

      it ('should be able to insert transaction', async () => {
          assert(!await shouldThrow(
              insertTransaction(
                  '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
                  '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
                  '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
                  '0',
                  '0x6cf76a6d00000000000000000000ed55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
                  0
              )));
      });

      it ('should be able to query transaction', async () => {
          await insertTransaction(
              '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
              '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
              '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
              '0',
              '0x6cf76a6d00000000000000000000ed55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
              0
          );

          const transaction = await queryTransaction('0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821');
          expect(transaction.value).to.equal('0');
          expect(transaction.hash).to.equal('0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821');
          expect(transaction.from).to.equal('0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab');
          expect(transaction.to).to.equal('0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab');
          expect(transaction.input).to.equal('0x6cf76a6d00000000000000000000ed55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821');
          expect(transaction.blockNumber).to.equal(0);
      });
  });
}