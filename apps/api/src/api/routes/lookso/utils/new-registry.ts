import { applyChangesToRegistry } from '../../../../lib/lookso/registry/apply-changes-to-registry';
import { uploadToArweave } from '../../../../lib/arweave/utils/uploadToArweave';
import { objectToBuffer } from '../../../../lib/utils/file-converters';
import { buildJsonUrl } from '../../../../lib/utils/json-url';
import { MAX_OFFCHAIN_REGISTRY_CHANGES } from '../../../../environment/config';

/**
 * createNewRegistryAndGetJsonUrl - Creates a new registry and returns its JSON URL.
 *
 * @param {number} registryChangesCount - The current number of registry changes for the address.
 * @param {any} address - The address for which the registry is being created.
 *
 * @returns {Promise<string>} A promise that resolves to the JSON URL of the new registry.
 */
export const createNewRegistryAndGetJsonUrl = async (
  registryChangesCount: number,
  address: any,
): Promise<string> => {
  // Create a new registry
  const newRegistry = await applyChangesToRegistry(address);

  // Upload the new registry to Arweave and build its JSON URL
  const url = await uploadToArweave(objectToBuffer(newRegistry), 'application/json');
  return buildJsonUrl(newRegistry, url);
};

/**
 * createNewRegistryIfCountAboutToExceedMax - Creates a new registry if the registry changes count is about to exceed the max.
 *
 * @param {number} registryChangesCount - The current number of registry changes for the address.
 * @param {any} address - The address for which the registry is being created.
 *
 * @returns {Promise<{ jsonUrl?: string }>} A promise that resolves to an object with a possible 'jsonUrl' property if the registry change count is about to exceed the max.
 */
export const createNewRegistryIfCountAboutToExceedMax = async (
  registryChangesCount: number,
  address: any,
): Promise<{ jsonUrl?: string }> => {
  // Check if the registry change count is about to exceed the max
  if (registryChangesCount + 1 >= MAX_OFFCHAIN_REGISTRY_CHANGES) {
    return { jsonUrl: await createNewRegistryAndGetJsonUrl(registryChangesCount, address) };
  } else {
    return {};
  }
};
