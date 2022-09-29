
import {insertPost, queryPost} from "../../../../bin/db/post.table";
import {LSPXXProfilePost} from "../../../../bin/lookso/registry/types/profile-post";
import {Log} from "../../../../models/types/log";
import {INDEX_DATA} from "../../config";
import {insertNotification} from "../../../../bin/db/notification.table";
import {logError} from "../../../../bin/logger";
import {USER_TAG_REGEX} from "../../../../bin/utils/constants";
import {queryAddressOfUserTag} from "../../../../bin/db/contract-metadata.table";


//TODO Add in post DB Table a visibility value (so if a post is deleted from the registry, we still keep it)
export async function indexRegistryPost(log: Log, post: LSPXXProfilePost, hash: string, date: Date, trusted: boolean) {
  if (!INDEX_DATA) return;
  try {
    await insertPost(
      hash,
      post.author,
      date,
      post.message,
      post.asset ? post.asset.fileType + ';' + post.asset.url : '',
      post.parentHash ? post.parentHash : null,
      post.childHash ? post.childHash : null,
      null,
      true,
      log.transactionHash,
      trusted
    );
    if (post.childHash) {
      const childPost = await queryPost(post.childHash);
      await insertNotification(childPost.author, post.author, new Date(), 'repost', hash);
    }
    if (post.parentHash) {
      const parentPost = await queryPost(post.parentHash);
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