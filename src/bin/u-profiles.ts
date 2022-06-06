import {getErc725YValues} from './erc725Y-reader';
import {generateAddressPermissionsKey} from './utils/keys-generator';
import {Permissions} from '../lib/models/types/permissions';
import { ERC725 } from '@erc725/erc725.js';
import {createContractObject} from './web3/contract';
import {logError} from './logger';

export async function getPermissions(
	upAddress: string,
	address: string
): Promise<Permissions | false> {
	try {
		const contract = await createContractObject(upAddress, 'ERC725Y');
		const owner: string = await contract.methods.owner().call();
		// If the address is the owner of the contract, the permission key is full (0xffff...)
		// If not, we need to fetch the permissions from the contract
		const permissionsKey = owner.toUpperCase() === address.toUpperCase() ? '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
			: (await getErc725YValues(upAddress, [generateAddressPermissionsKey(address)]))[0];
		if (permissionsKey === '0x') return false;
		return ERC725.decodePermissions(permissionsKey);
	} catch (e) {
		logError(e);
		throw e;
	}
}
