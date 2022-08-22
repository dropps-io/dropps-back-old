
import {insertPost} from "../../../../bin/db/post.table";
import {LSPXXProfilePost} from "../../../../bin/lookso/registry/types/profile-post";
import {Log} from "../../../../models/types/log";
import {INDEX_DATA} from "../../config";


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
  } catch (e) {
    console.log(e);
  }
}