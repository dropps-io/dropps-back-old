import { ethers } from 'ethers';
import {HTTP_RPC} from '../../environment/config';

const provider = new ethers.JsonRpcProvider(HTTP_RPC);

export const erc725yGetData = async (address: string, dataKey: string): Promise<string | null> => {
	const contract = new ethers.Contract(address,     [{
		'inputs': [
			{
				'internalType': 'bytes32',
				'name': 'dataKey',
				'type': 'bytes32'
			}
		],
		'name': 'getData',
		'outputs': [
			{
				'internalType': 'bytes',
				'name': 'dataValue',
				'type': 'bytes'
			}
		],
		'stateMutability': 'view',
		'type': 'function'
	}], provider);
	const response = await contract.getData(dataKey);
	if (!response || response === '0x') return null;
	else return response;
};
