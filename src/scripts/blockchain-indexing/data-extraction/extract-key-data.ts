import ERC725, {ERC725JSONSchema} from "@erc725/erc725.js";
import axios from "axios";
import {formatUrl} from "../../../bin/utils/format-url";
import {updateLSP4Metadata} from "../data-indexing/contract-metadata/update-lsp4";
import {updateLSP3Profile} from "../data-indexing/contract-metadata/update-lsp3";
import LSP4DigitalAssetJSON from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import LSP3UniversalProfileMetadataJSON from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import {indexUpdateName, indexUpdateSymbol} from "../data-indexing/contract-metadata/index-update";
import {IPFS_GATEWAY, KEY_LSPXXSocialRegistry} from "../../../bin/utils/constants";
import {extractRegistry} from "./registry/extract-registry";
import {Log} from "../../../models/types/log";
import {web3} from "../../../bin/web3/web3";
import {URLDataWithHash} from "@erc725/erc725.js/build/main/src/types/encodeData/JSONURL";
import {LSP3UniversalProfile} from "../../../bin/UniversalProfile/models/lsp3-universal-profile.model";

export async function extractDataFromKey(log: Log, key: string, value?: string) {
  const erc725Y = new ERC725((LSP4DigitalAssetJSON as ERC725JSONSchema[]).concat(LSP3UniversalProfileMetadataJSON as ERC725JSONSchema[]), log.address, web3.currentProvider, {ipfsGateway: IPFS_GATEWAY});

  try {
    switch (key) {
      case '0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756': // LSP4TokenSymbol
        if (value) {
          indexUpdateSymbol(log.address, value);
        } else {
          const symbol: string = (await erc725Y.getData('LSP4TokenSymbol')).value as string;
          indexUpdateSymbol(log.address, symbol);
        }
        break;
      case '0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1': // LSP4TokenName
        if (value) {
          indexUpdateName(log.address, value);
        } else {
          const name: string = (await erc725Y.getData('LSP4TokenName')).value as string;
          indexUpdateName(log.address, name);
        }
        break;
      case '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e': // LSP4Metadata
        if (value) {
          const decoded = ERC725.decodeData([{value: [{key, value}], keyName: 'LSP4Metadata'}], LSP4DigitalAssetJSON as ERC725JSONSchema[]);
          const lsp4 = (await axios.get(formatUrl(decoded[0].value.url))).data;
          updateLSP4Metadata(log.address, lsp4 ? (lsp4 as any).LSP4Metadata : null);
        } else {
          const metadataData = await erc725Y.getData('LSP4Metadata');
          const url = formatUrl((metadataData.value as URLDataWithHash).url);
          const lsp4Metadata = (await axios.get(url)).data;
          updateLSP4Metadata(log.address, lsp4Metadata ? (lsp4Metadata as any).LSP4Metadata : null);
        }
        break;
      case '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5': // LSP3Profile
        if (value) {
          const decodedJsonUrl = ERC725.decodeData([{value: [{key, value}], keyName: 'LSP3Profile'}], LSP3UniversalProfileMetadataJSON as ERC725JSONSchema[]);
          const lsp3 = (await axios.get(formatUrl(decodedJsonUrl[0].value.url))).data;
          updateLSP3Profile(log.address, lsp3 ? (lsp3 as any).LSP3Profile : null);
        } else {
          const metadataData = await erc725Y.getData('LSP3Profile');
          const url = formatUrl((metadataData.value as URLDataWithHash).url);
          const res = (await axios.get(url)).data;
          if (!res) return;
          updateLSP3Profile(log.address, (res as any).LSP3Profile as LSP3UniversalProfile);
        }
        break;
      case KEY_LSPXXSocialRegistry:
        if (value) {
          // TODO Implement
        } else {
          extractRegistry(log);
        }
        break;
    }
  } catch (e) {
    console.error(e);
  }

}