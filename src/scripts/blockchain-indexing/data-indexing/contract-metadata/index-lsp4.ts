import {LSP4DigitalAsset} from "../../../../bin/UniversalProfile/models/lsp4-digital-asset.model";
import {insertContractMetadata} from "../../../../bin/db/contract-metadata.table";
import {tryExecuting} from "../../../../bin/utils/try-executing";
import {insertAsset} from "../../../../bin/db/asset.table";
import {insertImage} from "../../../../bin/db/image.table";
import {insertLink} from "../../../../bin/db/link.table";
import {INDEX_DATA} from "../../config";

export async function indexLSP4Data(address: string, lsp4: LSP4DigitalAsset, isNFT: boolean, supply: string) {
  if (!INDEX_DATA) return;
  await insertContractMetadata(address, lsp4.name, lsp4.symbol, lsp4.metadata.description, true, supply);
  for (let asset of lsp4.metadata.assets) await tryExecuting(insertAsset(address, asset.url, asset.fileType, asset.hash));
  for (let image of lsp4.metadata.images) await tryExecuting(insertImage(address, image.url, image.width, image.height, '', image.hash));
  for (let link of lsp4.metadata.links) await tryExecuting(insertLink(address, link.title, link.url));
  for (let icon of lsp4.metadata.icon) await tryExecuting(insertImage(address, icon.url, icon.width, icon.height, 'icon', icon.hash));
}