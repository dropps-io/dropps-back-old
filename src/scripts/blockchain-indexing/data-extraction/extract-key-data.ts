import ERC725, {ERC725JSONSchema} from "@erc725/erc725.js";
import axios from "axios";
import {formatUrl} from "../../../bin/utils/format-url";
import {updateLSP4Metadata} from "../data-indexing/contract-metadata/update-lsp4";
import {updateLSP3Profile} from "../data-indexing/contract-metadata/update-lsp3";
import LSP4DigitalAssetJSON from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import LSP3UniversalProfileMetadataJSON from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import {indexUpdateName, indexUpdateSymbol} from "../data-indexing/contract-metadata/index-update";

export async function extractDataFromKey(address: string, key: string, value?: string) {
  switch (key) {
    case '0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756': // LSP4TokenSymbol
      if (value) {
        await indexUpdateSymbol(address, value);
      } else {
        // TODO Implement
      }
      break;
    case '0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1': // LSP4TokenName
      if (value) {
        await indexUpdateName(address, value);
      } else {
        // TODO Implement
      }
      break;
    case '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e': // LSP4Metadata
      if (value) {
        const decoded = ERC725.decodeData([{value: [{key, value}], keyName: 'LSP4Metadata'}], LSP4DigitalAssetJSON as ERC725JSONSchema[]);
        const lsp4 = (await axios.get(formatUrl(decoded[0].value.url))).data;
        await updateLSP4Metadata(address, lsp4 ? (lsp4 as any).LSP4Metadata : null);
      } else {
        // TODO Implement
      }
      break;
    case '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5': // LSP3Profile
      if (value) {
        const decodedJsonUrl = ERC725.decodeData([{value: [{key, value}], keyName: 'LSP3Profile'}], LSP3UniversalProfileMetadataJSON as ERC725JSONSchema[]);
        const lsp3 = (await axios.get(formatUrl(decodedJsonUrl[0].value.url))).data;
        await updateLSP3Profile(address, lsp3 ? (lsp3 as any).LSP3Profile : null);
      } else {
        // TODO Implement
      }
      break;
    // case KEY_LSPXXSocialRegistry:
    //   if (value) {
    //     // TODO Implement
    //   } else {
    //     const profile: UniversalProfileReader = new UniversalProfileReader(address, IPFS_GATEWAY, web3);
    //     const jsonUrl: string = (await profile.getDataUnverified([KEY_LSPXXSocialRegistry]))[0] as string;
    //     console.log(jsonUrl)
    //     const decodedJsonUrl = ERC725.decodeData([{value: [{key, value: jsonUrl}], keyName: 'LSPXXSocialRegistry'}],
    //       [
    //         {
    //           "name": "LSPXXSocialRegistry",
    //           "key": "0x661d289e41fcd282d8f4b9c0af12c8506d995e5e9e685415517ab5bc8b908247",
    //           "keyType": "Singleton",
    //           "valueType": "bytes",
    //           "valueContent": "JSONURL"
    //         }
    //       ] as ERC725JSONSchema[]);
    //     console.log(decodedJsonUrl)
    //     const registry = (await axios.get(formatUrl(decodedJsonUrl[0].value.url))).data;
    //     console.log(registry);
    //   }
    //   break;
  }
}
