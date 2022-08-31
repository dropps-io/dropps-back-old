import {initialDigitalAssetMetadata, LSP4DigitalAsset} from "../../../../bin/UniversalProfile/models/lsp4-digital-asset.model";
import ERC725, {ERC725JSONSchema} from "@erc725/erc725.js";
import {formatUrl} from "../../../../bin/utils/format-url";
import {URLDataWithHash} from "@erc725/erc725.js/build/main/src/types/encodeData/JSONURL";
import axios from "axios";
import {web3} from "../../../../bin/web3/web3";
import LSP4DigitalAssetJSON from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import {IPFS_GATEWAY} from "../../../../environment/config";

export async function extractLSP4Data(address: string): Promise<LSP4DigitalAsset> {
  const erc725Y = new ERC725(LSP4DigitalAssetJSON as ERC725JSONSchema[], address, web3.currentProvider, {ipfsGateway: IPFS_GATEWAY});
  let lsp4Metadata, data;

  try {
    data = await erc725Y.getData(['LSP4TokenName', 'LSP4TokenSymbol']);
    const metadataData = await erc725Y.getData('LSP4Metadata');
    const url = formatUrl((metadataData.value as URLDataWithHash).url);
    lsp4Metadata = (await axios.get(url)).data;
  } catch (e) {
    lsp4Metadata = {value: null};
  }

  return {
    name: data && data[0].value ? data[0].value as string: '',
    symbol: data && data[1].value ? data[1].value as string: '',
    metadata: lsp4Metadata ? (lsp4Metadata as any).LSP4Metadata : initialDigitalAssetMetadata(),
  }
}