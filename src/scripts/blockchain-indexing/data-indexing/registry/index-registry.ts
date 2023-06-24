
import {insertPost, queryPost} from '../../../../bin/db/post.table';
import {LSP19ProfilePost} from '../../../../bin/lookso/registry/types/profile-post';
import {Log} from '../../../../models/types/log';
import {INDEX_DATA} from '../../config';
import {insertNotification} from '../../../../bin/db/notification.table';
import {logError} from '../../../../bin/logger';
import {USER_TAG_REGEX} from '../../../../bin/utils/constants';
import {queryAddressOfUserTag} from '../../../../bin/db/contract-metadata.table';


//TODO Add in post DB Table a visibility value (so if a post is deleted from the registry, we still keep it)
export async function indexRegistryPost(log: Log, post: LSP19ProfilePost, hash: string, date: Date, trusted: boolean) {
	if (!INDEX_DATA) return;
	try {
		await insertPost(
			hash,
			post.author,
			date,
			post.message,
			post.medias && post.medias.length > 0 ? post.medias[0].fileType + ';' + post.medias[0].url : '',
			post.parentPost ? post.parentPost.hash : null,
			post.childPost ? post.childPost.hash : null,
			null,
			true,
			log.transactionHash,
			trusted
		);
		if (post.childPost) {
			const childPost = await queryPost(post.childPost.hash);
			await insertNotification(childPost.author, post.author, new Date(), 'repost', hash);
		}
		if (post.parentPost) {
			const parentPost = await queryPost(post.parentPost.hash);
			await insertNotification(parentPost.author, post.author, new Date(), 'comment', hash);
		}
		const userTags = post.message.match(USER_TAG_REGEX);
		if (userTags) {
			for (const userTag of userTags) {
				try {
					const username: string = userTag.replace('@', '').split('#')[0];
					const digits: string = userTag.split('#')[1];
					const address = await queryAddressOfUserTag(username, digits);
					await insertNotification(address, post.author, new Date(), 'tag', hash);
				} catch (e) {
					logError(e);
				}
			}
		}
	} catch (e) {
		logError(e);
	}
}