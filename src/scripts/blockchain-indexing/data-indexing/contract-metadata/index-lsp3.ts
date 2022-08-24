import {insertContractMetadata} from "../../../../bin/db/contract-metadata.table";
import {tryExecuting} from "../../../../bin/utils/try-executing";
import {insertImage} from "../../../../bin/db/image.table";
import {insertLink} from "../../../../bin/db/link.table";
import {insertTag} from "../../../../bin/db/tag.table";
import {insertAsset} from "../../../../bin/db/asset.table";
import {LSP3UniversalProfile} from "../../../../bin/UniversalProfile/models/lsp3-universal-profile.model";
import {INDEX_DATA} from "../../config";

export async function indexLsp3Data(address: string, lsp3: LSP3UniversalProfile) {
  try {
    if (!INDEX_DATA) return;
    await insertContractMetadata(address, lsp3.name, '', lsp3.description, false, '0');
    for (let image of lsp3.backgroundImage) await tryExecuting(insertImage(address, image.url, image.width, image.height, 'background', image.hash));
    for (let image of lsp3.profileImage) await tryExecuting(insertImage(address, image.url, image.width, image.height, 'profile', image.hash));
    for (let link of lsp3.links) await tryExecuting(insertLink(address, link.title, link.url));
    for (let tag of lsp3.tags) await tryExecuting(insertTag(address, tag));
    if (lsp3.avatar) await tryExecuting(insertAsset(address, lsp3.avatar.url, lsp3.avatar.fileType, lsp3.avatar.hash));
  } catch (e) {
    console.error(e);
  }
}