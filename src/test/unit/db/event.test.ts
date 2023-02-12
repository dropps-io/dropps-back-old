import { beforeEach, describe } from 'mocha';
import { assert, expect } from 'chai';

import { clearDB } from '../../helpers/database-helper';
import { shouldThrow } from '../../helpers/should-throw';
import { UNIVERSAL_PROFILE_1 } from '../../helpers/constants';
import { insertContract } from '../../../lib/db/queries/contract.table';
import {
  insertEvent,
  queryEvent,
  queryEventByTh,
  updateEvent,
} from '../../../lib/db/queries/event.table';
import { insertTransaction } from '../../../lib/db/queries/transaction.table';

export const EventTests = () => {
  describe('Table EventTable', () => {
    beforeEach(async () => {
      await clearDB();
      await insertContract(UNIVERSAL_PROFILE_1, null);
      await insertTransaction(
        '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
        '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
        '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
        '0',
        '0x6cf76a6d00000000000000000000ed55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
        0,
      );
    });

    it('should be able to insert event', async () => {
      assert(
        !(await shouldThrow(
          insertEvent(
            UNIVERSAL_PROFILE_1,
            '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
            '',
            0,
            '',
            '',
          ),
        )),
      );
    });

    it('should be able to query event', async () => {
      const id = await insertEvent(
        UNIVERSAL_PROFILE_1,
        '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
        '01234567',
        0,
        '0x5f6c557fc82516a035640cdf1be081cd918dca7b19367571f9da46b6e82ccfa2',
        'ty',
      );

      const event = await queryEvent(id);
      expect(event.address).to.equal(UNIVERSAL_PROFILE_1);
      expect(event.type).to.equal('ty');
      expect(event.transactionHash).to.equal(
        '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
      );
      expect(event.logId).to.equal('01234567');
      expect(event.blockNumber).to.equal(0);
      expect(event.topic).to.equal(
        '0x5f6c557fc82516a035640cdf1be081cd918dca7b19367571f9da46b6e82ccfa2',
      );
    });

    it('should be able to query event by logId', async () => {
      const event = await queryEventByTh(
        '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
        '01234567',
      );
      expect(event.address).to.equal(UNIVERSAL_PROFILE_1);
      expect(event.type).to.equal('ty');
      expect(event.transactionHash).to.equal(
        '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
      );
      expect(event.logId).to.equal('01234567');
      expect(event.blockNumber).to.equal(0);
      expect(event.topic).to.equal(
        '0x5f6c557fc82516a035640cdf1be081cd918dca7b19367571f9da46b6e82ccfa2',
      );
    });

    it('should be able to update event', async () => {
      const id = await insertEvent(
        UNIVERSAL_PROFILE_1,
        '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
        '01234567',
        0,
        '0x5f6c557fc82516a035640cdf1be081cd918dca7b19367571f9da46b6e82ccfa2',
        'ty',
      );
      await updateEvent(id, 'Executed');

      const event = await queryEvent(id);
      expect(event.type).to.equal('Executed');
    });
  });
};
