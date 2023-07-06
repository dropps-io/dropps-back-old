import { ethers } from 'ethers';
import ERC725Y_artifact from '@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json';
import {HTTP_RPC} from '../../environment/config';

const provider = new ethers.JsonRpcProvider(HTTP_RPC);

export const erc725yGetData = async (address: string, dataKey: string): Promise<string | null> => {
	const contract = new ethers.Contract(address, ERC725Y_artifact.abi, provider);
	const response = await contract.getData(dataKey);
	if (!response || response === '0x') return null;
	else return response;
};
