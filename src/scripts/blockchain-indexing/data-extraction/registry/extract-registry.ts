import {SocialRegistry} from "../../../../bin/lookso/registry/types/social-registry";
import {queryPostHashesOfUser} from "../../../../bin/db/post.table";
import {ProfilePost} from "../../../../bin/lookso/registry/types/profile-post";
import axios from "axios";
import {formatUrl} from "../../../../bin/utils/format-url";
import {indexRegistryPost} from "../../data-indexing/registry/index-registry";
import {UniversalProfileReader} from "../../../../bin/UniversalProfile/UniversalProfileReader.class";
import {IPFS_GATEWAY, KEY_LSPXXSocialRegistry} from "../../../../bin/utils/constants";
import {web3} from "../../../../bin/web3/web3";
import {decodeJsonUrl} from "../../../../bin/utils/json-url";
import {Log} from "../../../../models/types/log";

export async function extractRegistry(log: Log, _jsonUrl?: string) {
  const profile: UniversalProfileReader = new UniversalProfileReader(log.address, IPFS_GATEWAY, web3);
  const jsonUrl: string = _jsonUrl ? _jsonUrl : (await profile.getDataUnverified([KEY_LSPXXSocialRegistry]))[0] as string;
  const registry: SocialRegistry = (await axios.get(formatUrl(decodeJsonUrl(jsonUrl)))).data as SocialRegistry;
  await extractRegistryPosts(log, registry.posts);
}

async function extractRegistryPosts(log: Log, posts: {hash: string, url: string}[]) {
  const postHashes = await queryPostHashesOfUser(log.address, 99999, 0, 'post');
  for (const post of posts) {
    if (!postHashes.includes(post.hash)) {
      const profilePost: ProfilePost = (await axios.get(formatUrl(post.url))).data as ProfilePost;
      await indexRegistryPost(log, profilePost.LSPXXProfilePost, profilePost.LSPXXProfilePostHash);
    }
  }
}