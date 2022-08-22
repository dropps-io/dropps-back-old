
import {insertPost, queryPost} from "../../../../bin/db/post.table";
import {LSPXXProfilePost} from "../../../../bin/lookso/registry/types/profile-post";
import {Log} from "../../../../models/types/log";
import {INDEX_DATA} from "../../config";
import {insertNotification} from "../../../../bin/db/notification.table";


//TODO Add in post DB Table a visibility value (so if a post is deleted from the registry, we still keep it)
export async function indexRegistryPost(log: Log, post: LSPXXProfilePost, hash: string, date: Date) {
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
      log.transactionHash
    );
    if (post.childHash) {
      const childPost = await queryPost(post.childHash);
      await insertNotification(childPost.author, post.author, new Date(), 'repost', hash);
    }
    if (post.parentHash) {
      const parentPost = await queryPost(post.parentHash);
      await insertNotification(parentPost.author, post.author, new Date(), 'comment', hash);
    }
  } catch (e) {
    console.log(e);
  }
}