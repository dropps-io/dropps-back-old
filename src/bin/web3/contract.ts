import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import {web3} from './web3';

type ContractType = 'ERC725Y';
/* eslint-disable */
export async function createContractObject(
	contractAddress: string,
	contractType: ContractType
): Promise<Contract> {
	const contract = await import('./artifacts/ERC725Y.json');
	return new web3.eth.Contract(contract.abi as AbiItem[], contractAddress);
}
