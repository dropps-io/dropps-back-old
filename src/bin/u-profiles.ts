import {getErc725YValues} from "./erc725Y-reader";
import {generateAddressPermissionsKey} from "./utils/keys-generator";
import {Permissions} from "../lib/models/types/permissions";
import { ERC725 } from '@erc725/erc725.js';
import {createContractObject} from "./web3/contract";

//TODO Improve by verifying if the owner of the UP is an KeyManager or not
//Because, if not, we'll only verify the owner of the UP
export async function getPermissions(
  upAddress: string,
  address: string
): Promise<Permissions | false> {
  try {
    const contract = await createContractObject(upAddress, 'ERC725Y');
    const owner: string = await contract.methods.owner().call();
    const permissionsKey = owner.toUpperCase() === address.toUpperCase() ? '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      : (await getErc725YValues(upAddress, [generateAddressPermissionsKey(address)]))[0];
    if (permissionsKey === '0x') return false;
    return ERC725.decodePermissions(permissionsKey);
  } catch (e) {
    console.error(e);
    throw e;
  }
}
