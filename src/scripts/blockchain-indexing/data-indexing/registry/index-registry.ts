
import {insertPost} from "../../../../bin/db/post.table";
import {LSPXXProfilePost} from "../../../../bin/lookso/registry/types/profile-post";
import {web3} from "../../../../bin/web3/web3";
import {Log} from "../../../../models/types/log";
import {INDEX_DATA} from "../../config";


//TODO Add in post DB Table a visibility value (so if a post is deleted from the registry, we still keep it)
export async function indexRegistryPost(log: Log, post: LSPXXProfilePost, hash: string) {
  if (!INDEX_DATA) return;
  await insertPost(
    hash,
    post.author,
    new Date(((await web3.eth.getBlock(log.blockNumber)).timestamp as number) * 1000),
    post.message,
    post.asset ? post.asset.fileType + ';' + post.asset.url : '',
    post.parentHash ? post.parentHash : null,
    post.childHash ? post.childHash : null,
    null
  );
}