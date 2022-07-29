import Web3 from "web3";
import {LSP4DigitalAsset} from "../../../UniversalProfile/models/lsp4-digital-asset.model";
import ERC725, {ERC725JSONSchema} from "@erc725/erc725.js";
import LSP4DigitalAssetJSON from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

export async function extractLSP4Data(address: string, web3: Web3): Promise<LSP4DigitalAsset> {
    const erc725Y = new ERC725(LSP4DigitalAssetJSON as ERC725JSONSchema[], address, web3.currentProvider, {ipfsGateway: 'https://2eff.lukso.dev/ipfs/'});
    let lsp4Metadata, data;

    try {
        data = await erc725Y.getData(['LSP4TokenName', 'LSP4TokenSymbol']);
        lsp4Metadata = await erc725Y.fetchData('LSP4Metadata');
    } catch (e) {
        lsp4Metadata = {value: null};
    }

    return {
        name: data && data[0].value ? data[0].value as string: '',
        symbol: data && data[1].value ? data[1].value as string: '',
        metadata: lsp4Metadata.value ? (lsp4Metadata.value as any).LSP4Metadata : null,
    }
}