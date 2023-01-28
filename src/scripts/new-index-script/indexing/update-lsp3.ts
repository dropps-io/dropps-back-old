//TODO Quick and dirty, to improve, improve comparison (ex: if 2 images are the same (same hash) but one is for bg an other for profile we need to compare hash AND type)
// Split in different functions, same for the other updates

import {INDEX_DATA} from '../config';
import {deleteLink, insertLink, queryLinks} from '../../../bin/db/link.table';
import {LSP3UniversalProfile} from '../../../bin/UniversalProfile/models/lsp3-universal-profile.model';
import {deleteImage, insertImage, queryImages} from '../../../bin/db/image.table';
import {Image} from '../../../models/types/image';
import {deleteTag, insertTag, queryTags} from '../../../bin/db/tag.table';
import {updateContractDescription, updateContractName} from '../../../bin/db/contract-metadata.table';
import {Link} from '../../../models/types/metadata-objects';
import {reportIndexingScriptError} from '../index-logger';

export async function updateLSP3Profile(address: string, lsp3: LSP3UniversalProfile) {
	if (!INDEX_DATA) return;
	if (!lsp3) return;

	try {
		const images: Image[] = await queryImages(address);
		const links: Link[] = await queryLinks(address);
		const tags: string[] = await queryTags(address);

		try {
			await updateContractDescription(address, lsp3.description);
		} catch (e) {
			await reportIndexingScriptError('updateLSP3Metadata:description', e);
		}
		try {
			await updateContractName(address, lsp3.name);
		} catch (e) {
			await reportIndexingScriptError('updateLSP3Metadata:name', e);
		}

		const imagesToDelete = images.filter(i => !lsp3.profileImage.map(x => x.hash).includes(i.hash) && !lsp3.backgroundImage.map(x => x.hash).includes(i.hash));
		const profileImagesToAdd = lsp3.profileImage ? lsp3.profileImage.filter(i => !images.map(x => x.hash).includes(i.hash)) : [];
		const backgroundImagesToAdd = lsp3.backgroundImage ? lsp3.backgroundImage.filter(i => !images.map(x => x.hash).includes(i.hash)) : [];

		for (const image of imagesToDelete) {
			try {
				await deleteImage(address, image.url);
			} catch (e) {
				await reportIndexingScriptError('updateLSP3Metadata:imagesDelete', e);
			}
		}
		for (const image of profileImagesToAdd) {
			try {
				await insertImage(address, image.url, image.width, image.height, 'profile', image.hash);
			} catch (e) {
				await reportIndexingScriptError('updateLSP3Metadata:profileImagesAdd', e);
			}
		}
		for (const image of backgroundImagesToAdd) {
			try {
				await insertImage(address, image.url, image.width, image.height, 'background', image.hash);
			} catch (e) {
				await reportIndexingScriptError('updateLSP3Metadata:backgroundImagesAdd', e);
			}
		}

		const linksToDelete = links.filter(i => !lsp3.links.map(x => x.url).includes(i.url));
		const linksToAdd = lsp3.links ? lsp3.links.filter(i => !links.map(x => x.url).includes(i.url)) : [];

		for (const link of linksToDelete) {
			try {
				await deleteLink(address, link.title, link.url);
			} catch (e) {
				await reportIndexingScriptError('updateLSP3Metadata:linksDelete', e);
			}
		}
		for (const link of linksToAdd) {
			try {
				await insertLink(address, link.title, link.url);
			} catch (e) {
				await reportIndexingScriptError('updateLSP3Metadata:LinksAdd', e);
			}
		}

		const tagsToDelete = tags.filter(i => !lsp3.tags.includes(i));
		const tagsToAdd = lsp3.tags ? lsp3.tags.filter(i => !tags.includes(i)) : [];

		for (const tag of tagsToDelete) {
			try {
				await deleteTag(address, tag);
			} catch (e) {
				await reportIndexingScriptError('updateLSP3Metadata:tagsDelete', e);
			}
		}
		for (const tag of tagsToAdd) {
			try {
				await insertTag(address, tag);
			} catch (e) {
				await reportIndexingScriptError('updateLSP3Metadata:tagsAdd', e);
			}
		}
	} catch (e) {
		await reportIndexingScriptError('updateLSP3Metadata', e);
	}
}