//TODO Quick and dirty, to improve
import {LSP4DigitalAssetMetadata} from "../../../../bin/UniversalProfile/models/lsp4-digital-asset.model";
import {Image} from "../../../../models/types/image";
import {deleteImage, insertImage, queryImages} from "../../../../bin/db/image.table";
import {Asset} from "../../../../models/types/asset";
import {deleteAsset, insertAsset, queryAssets} from "../../../../bin/db/asset.table";
import {Link} from "../../../../models/types/link";
import {deleteLink, insertLink, queryLinks} from "../../../../bin/db/link.table";
import {updateContractDescription} from "../../../../bin/db/contract-metadata.table";
import {INDEX_DATA} from "../../config";

export async function updateLSP4Metadata(address: string, lsp4: LSP4DigitalAssetMetadata) {
  if (!INDEX_DATA) return;
  if (!lsp4) return;

  try {
    const images: Image[] = await queryImages(address);
    const assets: Asset[] = await queryAssets(address);
    const links: Link[] = await queryLinks(address);

    await updateContractDescription(address, lsp4.description);

    const imagesToDelete = images.filter(i => !lsp4.images.map(x => x.hash).includes(i.hash) && !lsp4.icon.map(x => x.hash).includes(i.hash));
    const imagesToAdd = lsp4.images.filter(i => !images.map(x => x.hash).includes(i.hash));
    const iconsToAdd = lsp4.icon.filter(i => !images.map(x => x.hash).includes(i.hash));

    for (let image of imagesToDelete) await deleteImage(address, image.url);
    for (let image of imagesToAdd) await insertImage(address, image.url, image.width, image.height, '', image.hash);
    for (let image of iconsToAdd) await insertImage(address, image.url, image.width, image.height, 'icon', image.hash);

    const assetsToDelete = assets.filter(i => !lsp4.assets.map(x => x.hash).includes(i.hash));
    const assetsToAdd = lsp4.assets.filter(i => !assets.map(x => x.hash).includes(i.hash));

    for (let asset of assetsToDelete) await deleteAsset(address, asset.url);
    for (let asset of assetsToAdd) await insertAsset(address, asset.url, asset.fileType, asset.hash);

    const linksToDelete = links.filter(i => !lsp4.links.map(x => x.url).includes(i.url));
    const linksToAdd = lsp4.links.filter(i => !links.map(x => x.url).includes(i.url));

    for (let link of linksToDelete) await deleteLink(address, link.title, link.url);
    for (let link of linksToAdd) await insertLink(address, link.title, link.url);
  } catch (e) {
    console.error(e);
  }
}