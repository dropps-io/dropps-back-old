import { insertNonce, queryNonce, updateNonce } from '../../../lib/db/queries/nonces.table';
import { createSiweMessage } from './utils/create-siwe-message';
import { generateAddressWithSignature } from './utils/generate-address-with-signature';
import { UniversalProfileReader } from '../../../lib/UniversalProfile/UniversalProfileReader.class';
import { IPFS_GATEWAY, JWT_VALIDITY_TIME } from '../../../environment/config';
import { web3 } from '../../../lib/web3';
import { ERROR_INCORRECT_SIGNED_NONCE } from '../../../lib/utils/error-messages';

/**
 * Get the address and SIWE message for authentication purposes.
 *
 * @param {string} address - The address to authenticate.
 * @param {string} [path] - The path to authenticate for. Defaults to '/'.
 * @returns {Promise<{ message: string; issuedAt: string }>} - The SIWE message and the issued at date.
 */
export const getAddressSiwe = async (
  address: string,
  path?: string,
): Promise<{ message: string; issuedAt: string }> => {
  let nonce: string = await queryNonce(address);
  if (!nonce) nonce = await insertNonce(address);

  const issuedAt = new Date().toISOString();
  const message = createSiweMessage(address, issuedAt, path ? path : '/', nonce);
  return { message, issuedAt };
};

/**
 * Handle the authorization process given the signed message.
 *
 * @param {string} address - The address to authenticate.
 * @param {string} issuedAt - The issued at date.
 * @param {string} signedMessage - The signed message.
 * @param {string} [path] - The path to authenticate for. Defaults to '/'.
 *
 * @returns {Promise<Date>} - The expiration date of the authorization.
 *
 * @throws {ERROR_INCORRECT_SIGNED_NONCE} - If the signed message is incorrect.
 */
export const handleAuthorizationWithSignature = async (
  address: string,
  issuedAt: string,
  signedMessage: string,
  path?: string,
): Promise<Date> => {
  const nonce: string = await queryNonce(address);
  const message = createSiweMessage(address, issuedAt, path ? path : '/', nonce);

  const controllerAddress = generateAddressWithSignature(message, signedMessage);
  const profile = new UniversalProfileReader(address, IPFS_GATEWAY, web3);
  const permissions = await profile.fetchPermissionsOf(controllerAddress);
  if (!(permissions && permissions.SIGN)) throw ERROR_INCORRECT_SIGNED_NONCE;
  // User is auth

  await updateNonce(address);

  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + JWT_VALIDITY_TIME * 60 * 60 * 1000); // 6 hours from now

  return expirationDate;
};
