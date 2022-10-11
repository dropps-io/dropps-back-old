import ERC725, {ERC725JSONSchema} from "@erc725/erc725.js";
import {initialUniversalProfile, LSP3UniversalProfile} from "../../../../bin/UniversalProfile/models/lsp3-universal-profile.model";
import {formatUrl} from "../../../../bin/utils/format-url";
import {URLDataWithHash} from "@erc725/erc725.js/build/main/src/types/encodeData/JSONURL";
import axios from "axios";
import {web3} from "../../../../bin/web3/web3";
import LSP3UniversalProfileMetadataJSON from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import {IPFS_GATEWAY} from "../../../../environment/config";
import {ContractFullMetadata} from "../../models/contract-metadata.model";
import {reportIndexingScriptError} from "../../index-logger";

export async function extractLSP3Data(address: string): Promise<ContractFullMetadata> {
  const erc725Y = new ERC725(LSP3UniversalProfileMetadataJSON as ERC725JSONSchema[], address, web3.currentProvider, {ipfsGateway: IPFS_GATEWAY});
  let lsp3: LSP3UniversalProfile;

  try {
    const data = await erc725Y.getData('LSP3Profile');
    if (data.value) {
      const url = formatUrl((data.value as URLDataWithHash).url);
      const res = (await axios.get(url)).data;
      lsp3 = res ? (res as any).LSP3Profile as LSP3UniversalProfile : initialUniversalProfile();
    } else {
      lsp3 = initialUniversalProfile();
    }
  } catch (e) {
    await reportIndexingScriptError('extractLSP3Data', e);
    lsp3 = initialUniversalProfile();
  }

  return {
    ...lsp3,
    isNFT: false,
    symbol: '',
    images: [],
    assets: [],
    icon: []
  }
}