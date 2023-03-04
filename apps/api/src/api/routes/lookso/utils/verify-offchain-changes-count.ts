import { queryRegistryChangesCountOfAddress } from '../../../../lib/db/queries/registry-change.table';
import { MAX_OFFCHAIN_REGISTRY_CHANGES } from '../../../../environment/config';
import { PUSH_REGISTRY_REQUIRED } from '../../../../lib/utils/error-messages';

/**
 * Verifies the number of off-chain registry changes for a given address
 *
 * @param {string} address - Ethereum address
 *
 * @returns {Promise<number>} The number of registry changes of the address
 *
 * @throws {PUSH_REGISTRY_REQUIRED} When the registry changes count is equal or greater than MAX_OFFCHAIN_REGISTRY_CHANGES
 */
export const verifyOffchainChangesCount = async (address: string): Promise<number> => {
  const registryChangesCount = await queryRegistryChangesCountOfAddress(address);
  // If the number of registry changes is equal or greater than MAX_OFFCHAIN_REGISTRY_CHANGES,
  // an exception is thrown indicating that the on-chain registry needs to be updated
  if (registryChangesCount >= MAX_OFFCHAIN_REGISTRY_CHANGES) {
    throw PUSH_REGISTRY_REQUIRED;
  }
  // Return the number of registry changes for the address
  return registryChangesCount;
};
