//TODO Quick and dirty, to improve

import {deleteLink, insertLink, queryLinks} from '../../../bin/db/link.table';
import {deleteImage, insertImage, queryImages} from '../../../bin/db/image.table';
import {deleteAsset, insertAsset, queryAssets} from '../../../bin/db/asset.table';
import {ImageTable} from '../../../models/types/tables/image-table';
import {updateContractDescription} from '../../../bin/db/contract-metadata.table';
import {LSP4DigitalAssetMetadata} from '../../../bin/UniversalProfile/models/lsp4-digital-asset.model';
import {AssetTable} from '../../../models/types/tables/asset-table';
import {INDEX_DATA} from '../config';
import {Link} from '../../../models/types/metadata-objects';
import {reportIndexingScriptError} from '../index-logger';

export async function updateLSP4Metadata(address: string, lsp4: LSP4DigitalAssetMetadata) {
	if (!INDEX_DATA) return;
	if (!lsp4) return;

	try {
		const images: ImageTable[] = await queryImages(address);
		const assets: AssetTable[] = await queryAssets(address);
		const links: Link[] = await queryLinks(address);

		try {
			await updateContractDescription(address, lsp4.description);
		} catch (e) {
			await reportIndexingScriptError('updateLSP4Metadata:description', e);
		}

		const imagesToDelete = images.filter(i => !lsp4.images.flat().map(x => x.hash).includes(i.hash) && !lsp4.icon.map(x => x.hash).includes(i.hash));
		const imagesToAdd = lsp4.images ? lsp4.images.flat().filter(i => !images.map(x => x.hash).includes(i.hash)) : [];
		const iconsToAdd = lsp4.icon ? lsp4.icon.filter(i => !images.map(x => x.hash).includes(i.hash)) : [];

		for (const image of imagesToDelete) {
			try {
				await deleteImage(address, image.url);
			} catch (e) {
				await reportIndexingScriptError('updateLSP4Metadata:imageDelete', e);
			}
		}
		for (const image of imagesToAdd) {
			try {
				await insertImage(address, image.url, image.width, image.height, '', image.hash);
			} catch (e) {
				await reportIndexingScriptError('updateLSP4Metadata:imageAdd', e, {image, imagesToAdd, lsp4});
			}
		}
		for (const image of iconsToAdd) {
			try {
				await insertImage(address, image.url, image.width, image.height, 'icon', image.hash);
			} catch (e) {
				await reportIndexingScriptError('updateLSP4Metadata:iconsAdd', e);
			}
		}

		const assetsToDelete = assets.filter(i => !lsp4.assets.map(x => x.hash).includes(i.hash));
		const assetsToAdd = lsp4.assets ? lsp4.assets.filter(i => !assets.map(x => x.hash).includes(i.hash)) : [];

		for (const asset of assetsToDelete) {
			try {
				await deleteAsset(address, asset.url);
			} catch (e) {
				await reportIndexingScriptError('updateLSP4Metadata:assetToDelete', e);
			}
		}
		for (const asset of assetsToAdd) {
			try {
				await insertAsset(address, asset.url, asset.fileType, asset.hash);
			} catch (e) {
				await reportIndexingScriptError('updateLSP4Metadata:assetToAdd', e);
			}
		}

		const linksToDelete = links.filter(i => !lsp4.links.map(x => x.url).includes(i.url));
		const linksToAdd = lsp4.links ? lsp4.links.filter(i => !links.map(x => x.url).includes(i.url)) : [];

		for (const link of linksToDelete) {
			try {
				await deleteLink(address, link.title, link.url);
			} catch (e) {
				await reportIndexingScriptError('updateLSP4Metadata', e);
			}
		}
		for (const link of linksToAdd) {
			try {
				await insertLink(address, link.title, link.url);
			} catch (e) {
				await reportIndexingScriptError('updateLSP4Metadata', e);
			}
		}
	} catch (e) {
		await reportIndexingScriptError('updateLSP4Metadata', e);
	}
}