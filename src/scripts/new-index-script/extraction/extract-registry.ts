import axios from 'axios';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { decodeJsonUrl } from '../../../bin/utils/json-url';
import { formatUrl } from '../../../bin/utils/format-url';
import { UniversalProfileReader } from '../../../bin/UniversalProfile/UniversalProfileReader.class';
import { IPFS_GATEWAY, POST_VALIDATOR_ADDRESS } from '../../../environment/config';
import { Log } from '../../../models/types/log';
import { web3 } from '../../../bin/web3/web3';
import { queryPostHashesOfUser } from '../../../bin/db/post.table';
import { KEY_LSPXXSocialRegistry } from '../../../bin/utils/constants';
import { SocialRegistry } from '../../../bin/lookso/registry/types/social-registry';
import { ProfilePost } from '../../../bin/lookso/registry/types/profile-post';
import PostValidatorContract from '../../../assets/artifacts/ValidatorContractArtifact.json';
import { Post } from '../../../models/types/post';
import { incrementExtractedToLogOf, reportIndexingScriptError } from '../index-logger';
import { querySenderLikes } from '../../../bin/db/like.table';
import { queryFollowing } from '../../../bin/db/follow.table';

export type RegistryChangesToIndex = {
  posts: { toAdd: Post[] };
  likes: { toAdd: string[] };
  follows: { toAdd: string[] };
};

export async function extractRegistry(
  log: Log,
  _jsonUrl?: string,
): Promise<RegistryChangesToIndex> {
  const response: RegistryChangesToIndex = {
    posts: { toAdd: [] },
    follows: { toAdd: [] },
    likes: { toAdd: [] },
  };
  let registry: SocialRegistry;
  try {
    const profile: UniversalProfileReader = new UniversalProfileReader(
      log.address,
      IPFS_GATEWAY,
      web3,
    );
    const jsonUrl: string = _jsonUrl
      ? _jsonUrl
      : ((await profile.getDataUnverified([KEY_LSPXXSocialRegistry]))[0] as string);
    registry = (await axios.get(formatUrl(decodeJsonUrl(jsonUrl)))).data as SocialRegistry;
  } catch (e) {
    await reportIndexingScriptError('extractRegistry', e);
    return response;
  }

  try {
    response.posts.toAdd = await extractRegistryPosts(log, registry.posts);
  } catch (e) {
    await reportIndexingScriptError('extractRegistry:Posts', e);
  }
  try {
    response.likes.toAdd = await extractRegistryLikes(log, registry.likes);
  } catch (e) {
    await reportIndexingScriptError('extractRegistry:Likes', e);
  }
  try {
    response.follows.toAdd = await extractRegistryFollows(log, registry.follows);
  } catch (e) {
    await reportIndexingScriptError('extractRegistry:Follows', e);
  }

  incrementExtractedToLogOf('Registry');
  return response;
}

async function extractRegistryPosts(
  log: Log,
  posts: { hash: string; url: string }[],
): Promise<Post[]> {
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

        const trusted: boolean = POST_VALIDATOR_ADDRESS.includes(
          profilePost.LSPXXProfilePost.validator,
        );

        const postValidatorContract: Contract = new web3.eth.Contract(
          PostValidatorContract.abi as AbiItem[],
          profilePost.LSPXXProfilePost.validator,
        );
        const postTimestamp: string = await postValidatorContract.methods
          .getTimestamp(post.hash)
          .call();
        newPosts.push({
          hash: profilePost.LSPXXProfilePostHash,
          author: profilePost.LSPXXProfilePost.author,
          date: new Date(parseInt(postTimestamp) * 1000),
          text: profilePost.LSPXXProfilePost.message,
          mediaUrl: profilePost.LSPXXProfilePost.asset
            ? profilePost.LSPXXProfilePost.asset.fileType +
              ';' +
              profilePost.LSPXXProfilePost.asset.url
            : '',
          parentHash: profilePost.LSPXXProfilePost.parentHash,
          childHash: profilePost.LSPXXProfilePost.childHash,
          eventId: undefined,
          inRegistry: true,
          transactionHash: log.transactionHash,
          trusted,
        });
        incrementExtractedToLogOf('Registry:Post');
      }
    } catch (e) {
      await reportIndexingScriptError('extractRegistryPosts', e);
    }
  }

  return newPosts;
}

//TODO Right now it just add the likes from the registry, we need to handle the case where people deleted likes directly from the registry
async function extractRegistryLikes(log: Log, likes: string[]): Promise<string[]> {
  let indexedLikes: string[] = [];
  try {
    indexedLikes = await querySenderLikes(log.address);
  } catch (e) {
    await reportIndexingScriptError('extractRegistryLikes', e);
  }

  const likesToAdd: string[] = [];
  likes.forEach((like) => {
    if (!indexedLikes.includes(like)) likesToAdd.push(like);
  });

  return likesToAdd;
}

//TODO Right now it just add the follows from the registry, we need to handle the case where people deleted likes directly from the registry
async function extractRegistryFollows(log: Log, follows: string[]): Promise<string[]> {
  let indexedFollows: string[] = [];
  try {
    indexedFollows = await queryFollowing(log.address);
  } catch (e) {
    await reportIndexingScriptError('extractRegistryFollows', e);
  }

  const followsToAdd: string[] = [];
  follows.forEach((like) => {
    if (!indexedFollows.includes(like)) followsToAdd.push(like);
  });

  return followsToAdd;
}
