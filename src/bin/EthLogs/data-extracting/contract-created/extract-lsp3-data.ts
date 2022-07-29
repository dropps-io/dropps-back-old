import Web3 from "web3";
import {
    initialUniversalProfile,
    LSP3UniversalProfile
} from "../../../UniversalProfile/models/lsp3-universal-profile.model";
import ERC725, {ERC725JSONSchema} from "@erc725/erc725.js";
import LSP3UniversalProfileJSON from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';

export async function extractLSP3Data(address: string, web3: Web3): Promise<LSP3UniversalProfile> {
    const erc725Y = new ERC725(LSP3UniversalProfileJSON as ERC725JSONSchema[], address, web3.currentProvider, {ipfsGateway: 'https://2eff.lukso.dev/ipfs/'});
    let lsp3Profile;

    try {
        lsp3Profile = await erc725Y.fetchData('LSP3Profile');
    } catch (e) {
        lsp3Profile = {value: null};
    }

    return lsp3Profile.value ? (lsp3Profile.value as any).LSP3Profile as LSP3UniversalProfile : initialUniversalProfile();
}