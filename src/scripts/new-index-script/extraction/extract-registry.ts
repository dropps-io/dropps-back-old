import axios from "axios";
import {Contract} from "web3-eth-contract";
import {AbiItem} from "web3-utils";
import {decodeJsonUrl} from "../../../bin/utils/json-url";
import {formatUrl} from "../../../bin/utils/format-url";
import {UniversalProfileReader} from "../../../bin/UniversalProfile/UniversalProfileReader.class";
import {IPFS_GATEWAY, POST_VALIDATOR_ADDRESS} from "../../../environment/config";
import {Log} from "../../../models/types/log";
import {web3} from "../../../bin/web3/web3";
import {queryPostHashesOfUser} from "../../../bin/db/post.table";
import {KEY_LSPXXSocialRegistry} from "../../../bin/utils/constants";
import {SocialRegistry} from "../../../bin/lookso/registry/types/social-registry";
import {ProfilePost} from "../../../bin/lookso/registry/types/profile-post";
import PostValidatorContract from '../../../assets/artifacts/ValidatorContractArtifact.json';
import {Post} from "../../../models/types/post";
import {incrementExtractedToLogOf, reportIndexingScriptError} from "../index-logger";

export async function extractRegistry(log: Log, _jsonUrl?: string): Promise<Post[]> {
  try {
    const profile: UniversalProfileReader = new UniversalProfileReader(log.address, IPFS_GATEWAY, web3);
    const jsonUrl: string = _jsonUrl ? _jsonUrl : (await profile.getDataUnverified([KEY_LSPXXSocialRegistry]))[0] as string;
    const registry: SocialRegistry = (await axios.get(formatUrl(decodeJsonUrl(jsonUrl)))).data as SocialRegistry;
    incrementExtractedToLogOf('Registry');
    return await extractRegistryPosts(log, registry.posts);
    // TODO Extract Likes and Follows as well
  } catch (e) {
    await reportIndexingScriptError('extractRegistry', e);
    return [];
  }
}

async function extractRegistryPosts(log: Log, posts: {hash: string, url: string}[]): Promise<Post[]> {
  let postHashes: string[] = [];
  try {
    postHashes = await queryPostHashesOfUser(log.address, 99999, 0, 'post');
  } catch (e) {
    await reportIndexingScriptError('extractRegistryPosts:postHashes', e);
  }
  const newPosts: Post[] = [];
  for (const post of posts) {
    try {
      if (!postHashes.includes(post.hash)) {
        const profilePost: ProfilePost = (await axios.get(formatUrl(post.url))).data as ProfilePost;

        let trusted: boolean = POST_VALIDATOR_ADDRESS.includes(profilePost.LSPXXProfilePost.validator);

        const postValidatorContract: Contract = new web3.eth.Contract(PostValidatorContract.abi as AbiItem[], profilePost.LSPXXProfilePost.validator);
        const postTimestamp: string = await postValidatorContract.methods.getTimestamp(post.hash).call();
        newPosts.push({
          hash: profilePost.LSPXXProfilePostHash,
          author: profilePost.LSPXXProfilePost.author,
          date: new Date(parseInt(postTimestamp) * 1000),
          text: profilePost.LSPXXProfilePost.message,
          mediaUrl: profilePost.LSPXXProfilePost.asset ? profilePost.LSPXXProfilePost.asset.fileType + ';' + profilePost.LSPXXProfilePost.asset.url : '',
          parentHash: profilePost.LSPXXProfilePost.parentHash,
          childHash: profilePost.LSPXXProfilePost.childHash,
          eventId: undefined,
          inRegistry: true,
          transactionHash: log.transactionHash,
          trusted
        });
        incrementExtractedToLogOf('Registry:Post');

      }
    } catch (e) {
      await reportIndexingScriptError('extractRegistryPosts', e);
    }
  }

  return newPosts;
}