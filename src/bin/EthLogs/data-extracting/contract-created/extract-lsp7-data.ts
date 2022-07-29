import Web3 from "web3";
import {LSP7Data} from "../../EthLog.models";
import {LSP4DigitalAsset} from "../../../UniversalProfile/models/lsp4-digital-asset.model";
import {AbiItem} from "web3-utils";
import LSP7DigitalAsset from "@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json";
import {extractLSP4Data} from "./extract-lsp4-data";

export async function extractLSP7Data(address: string, web3: Web3): Promise<LSP7Data> {
    const lsp4Data: LSP4DigitalAsset = await extractLSP4Data(address, web3);
    const lsp7contract = new web3.eth.Contract(LSP7DigitalAsset.abi as AbiItem[], address);
    const isNFT: boolean = (await lsp7contract.methods.decimals().call()) === '0';
    const supply: number = await lsp7contract.methods.totalSupply().call();
    return {isNFT, supply, ...lsp4Data};
}