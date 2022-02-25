import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils'
import {web3} from "./web3";

type ContractType = 'ERC725Y';

export async function createContractObject(
  contractAddress: string,
  contractType: ContractType
): Promise<Contract> {
  const CONTRACT = await import('./artifacts/' + contractType + '.json');
  return new web3.eth.Contract(CONTRACT.abi as AbiItem[], contractAddress);
}
