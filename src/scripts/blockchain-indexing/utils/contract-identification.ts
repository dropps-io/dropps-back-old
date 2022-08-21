import {ContractInterface} from "../../../models/types/contract-interface";
import {queryContractInterfaces} from "../../../bin/db/contract-interface.table";
import {AbiItem} from "web3-utils";
import {web3} from "../../../bin/web3/web3";
import LSP0ERC725Account from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";


export async function tryIdentifyingContract(address: string): Promise<ContractInterface | undefined> {
  try {
    const contractCode = await web3.eth.getCode(address);
    const contractInterfaces: ContractInterface[] = await queryContractInterfaces();

    for (let i = 0 ; i < contractInterfaces.length ; i++) {
      if (contractCode.includes(contractInterfaces[i].id.slice(2, 10))) return contractInterfaces[i];
    }
    const contract = new web3.eth.Contract(LSP0ERC725Account.abi as AbiItem[], address);

    for (let i = 0 ; i < contractInterfaces.length ; i++) {
      if (await contract.methods.supportsInterface(contractInterfaces[i].id).call()) return contractInterfaces[i];
    }
  } catch (e) {
    return undefined;
  }

  return undefined;
}