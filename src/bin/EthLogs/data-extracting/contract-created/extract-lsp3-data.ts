import Web3 from "web3";

import {
    initialUniversalProfile,
    LSP3UniversalProfile
} from "../../../UniversalProfile/models/lsp3-universal-profile.model";
import ERC725, {ERC725JSONSchema} from "@erc725/erc725.js";
import LSP3UniversalProfileJSON from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import {URLDataWithHash} from "@erc725/erc725.js/build/main/src/types/encodeData/JSONURL";
import {formatUrl} from "../../../utils/format-url";
import axios from "axios";

export async function extractLSP3Data(address: string, web3: Web3): Promise<LSP3UniversalProfile> {
    const erc725Y = new ERC725(LSP3UniversalProfileJSON as ERC725JSONSchema[], address, web3.currentProvider, {ipfsGateway: 'https://2eff.lukso.dev/ipfs/'});
    let lsp3Profile;

    try {
        const data = await erc725Y.getData('LSP3Profile');
        const url = formatUrl((data.value as URLDataWithHash).url, 'https://2eff.lukso.dev/ipfs/');
        lsp3Profile = (await axios.get(url)).data;
    } catch (e) {
        console.error(e);
        lsp3Profile = {value: null};
    }

    return lsp3Profile ? (lsp3Profile as any).LSP3Profile as LSP3UniversalProfile : initialUniversalProfile();
}