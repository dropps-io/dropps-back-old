import {createContractObject} from "./web3/contract";
import {Contract} from "web3-eth-contract";

export async function getErc725YValues(
    contractAddress: string,
    keys: string[]
): Promise<string[]> {
    const contract: Contract = await createContractObject(contractAddress, 'ERC725Y');
    try {
        return await contract.methods.getData(keys).call();
    } catch (e) {
        console.error(e);
        throw e;
    }
}
