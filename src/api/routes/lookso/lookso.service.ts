import { insertRegistryChange } from '../../../lib/db/queries/registry-change.table';
import { ERROR_NOT_LSP0 } from '../../../lib/utils/error-messages';
import { queryContract } from '../../../lib/db/queries/contract.table';
import { insertFollow } from '../../../lib/db/queries/follow.table';
import { insertNotification } from '../../../lib/db/queries/notification.table';
import { verifyOffchainChangesCount } from './utils/verify-offchain-changes-count';
import { createNewRegistryIfCountAboutToExceedMax } from './utils/new-registry';

/**
 * follow - Adds a follow relationship between two addresses.
 *
 * @param {string} from - The address that is following.
 * @param {string} to - The address being followed.
 * @returns {Promise<{ jsonUrl?: string }>} A promise that resolves to an object with a possible 'jsonUrl' property if the registry change count is about to exceed the max.
 */
const follow = async (from: string, to: string): Promise<{ jsonUrl?: string }> => {
  // Verify the current off-chain changes count for the address
  const registryChangesCount = await verifyOffchainChangesCount(from);

  // Query the contract at the 'to' address and check if it is of type LSP0
  const contract = await queryContract(to);
  if (contract && contract.interfaceCode !== 'LSP0') throw ERROR_NOT_LSP0;

  // Insert follow information
  await insertFollow(from, to);
  await insertRegistryChange(from, 'follow', 'add', to, new Date());
  await insertNotification(to, from, new Date(), 'follow');

  // Create new registry if change count is about to exceed max
  return await createNewRegistryIfCountAboutToExceedMax(registryChangesCount, from);
};

export const looksoService = {
  follow,
};
