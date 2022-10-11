

//TODO Add in post DB Table a visibility value (so if a post is deleted from the registry, we still keep it)
import {Post} from "../../../models/types/post";
import {USER_TAG_REGEX} from "../../../bin/utils/constants";
import {insertPost, queryPost} from "../../../bin/db/post.table";
import {queryAddressOfUserTag} from "../../../bin/db/contract-metadata.table";
import {Log} from "../../../models/types/log";
import {insertNotification} from "../../../bin/db/notification.table";
import {INDEX_DATA} from "../config";
import {reportIndexingScriptError} from "../index-logger";

export async function indexRegistryPosts(log: Log, posts: Post[]) {
  if (!INDEX_DATA) return;
  for (let post of posts) {
    try {
      await insertPost(
        post.hash,
        post.author,
        post.date,
        post.text,
        post.mediaUrl,
        post.parentHash ? post.parentHash : null,
        post.childHash ? post.childHash : null,
        null,
        true,
        post.transactionHash,
        post.trusted
      );
      if (post.childHash) {
        const childPost = await queryPost(post.childHash);
        await insertNotification(childPost.author, post.author, new Date(), 'repost', post.hash);
      }
      if (post.parentHash) {
        const parentPost = await queryPost(post.parentHash);
        await insertNotification(parentPost.author, post.author, new Date(), 'comment', post.hash);
      }

      // Check if usertags in the post, if yes -> Notification
      const userTags = post.text.match(USER_TAG_REGEX);
      if (userTags) {
        for (const userTag of userTags) {
          try {
            const username: string = userTag.replace('@', '').split('#')[0];
            const digits: string = userTag.split('#')[1];
            const address = await queryAddressOfUserTag(username, digits);
            await insertNotification(address, post.author, new Date(), 'tag', post.hash);
          } catch (e) {
          }
        }
      }
    } catch (e) {
      await reportIndexingScriptError('', e, {log, posts, post});
    }
  }
}