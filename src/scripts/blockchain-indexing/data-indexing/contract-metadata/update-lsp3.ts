//TODO Quick and dirty, to improve, improve comparison (ex: if 2 images are the same (same hash) but one is for bg an other for profile we need to compare hash AND type)
import {LSP3UniversalProfile} from '../../../../bin/UniversalProfile/models/lsp3-universal-profile.model';
import {Image} from '../../../../models/types/image';
import {deleteImage, insertImage, queryImages} from '../../../../bin/db/image.table';
import {Link} from '../../../../models/types/link';
import {deleteLink, insertLink, queryLinks} from '../../../../bin/db/link.table';
import {deleteTag, insertTag, queryTags} from '../../../../bin/db/tag.table';
import {updateContractDescription, updateContractName} from '../../../../bin/db/contract-metadata.table';
import {INDEX_DATA} from '../../config';
import {tryExecuting} from '../../../../bin/utils/try-executing';
import {logError} from '../../../../bin/logger';

export async function updateLSP3Profile(address: string, lsp3: LSP3UniversalProfile) {
	if (!INDEX_DATA) return;
	if (!lsp3) return;

	try {
		const images: Image[] = await queryImages(address);
		const links: Link[] = await queryLinks(address);
		const tags: string[] = await queryTags(address);

		await updateContractDescription(address, lsp3.description);
		await updateContractName(address, lsp3.name);

		const imagesToDelete = images.filter(i => !lsp3.profileImage.map(x => x.hash).includes(i.hash) && !lsp3.backgroundImage.map(x => x.hash).includes(i.hash));
		const profileImagesToAdd = lsp3.profileImage ? lsp3.profileImage.filter(i => !images.map(x => x.hash).includes(i.hash)) : [];
		const backgroundImagesToAdd = lsp3.backgroundImage ? lsp3.backgroundImage.filter(i => !images.map(x => x.hash).includes(i.hash)) : [];

		for (const image of imagesToDelete) await tryExecuting(deleteImage(address, image.url));
		for (const image of profileImagesToAdd) await tryExecuting(insertImage(address, image.url, image.width, image.height, 'profile', image.hash));
		for (const image of backgroundImagesToAdd) await tryExecuting(insertImage(address, image.url, image.width, image.height, 'background', image.hash));

		const linksToDelete = links.filter(i => !lsp3.links.map(x => x.url).includes(i.url));
		const linksToAdd = lsp3.links ? lsp3.links.filter(i => !links.map(x => x.url).includes(i.url)) : [];

		for (const link of linksToDelete) await tryExecuting(deleteLink(address, link.title, link.url));
		for (const link of linksToAdd) await tryExecuting(insertLink(address, link.title, link.url));

		const tagsToDelete = tags.filter(i => !lsp3.tags.includes(i));
		const tagsToAdd = lsp3.tags ? lsp3.tags.filter(i => !tags.includes(i)) : [];

		for (const tag of tagsToDelete) await tryExecuting(deleteTag(address, tag));
		for (const tag of tagsToAdd) await tryExecuting(insertTag(address, tag));
	} catch (e) {
		logError(e);
	}
}