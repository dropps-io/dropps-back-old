import { insertRegistryChange } from '../../../lib/db/queries/registry-change.table';
import { ERROR_NOT_LSP0 } from '../../../lib/utils/error-messages';
import { queryContract } from '../../../lib/db/queries/contract.table';
import { insertFollow, removeFollow } from '../../../lib/db/queries/follow.table';
import { insertNotification } from '../../../lib/db/queries/notification.table';
import { verifyOffchainChangesCount } from './utils/verify-offchain-changes-count';
import { createNewRegistryIfCountAboutToExceedMax } from './utils/new-registry';
import { insertLike, queryPostLike, removeLike } from '../../../lib/db/queries/like.table';
import { queryPost, queryPosts, queryPostsCount } from '../../../lib/db/queries/post.table';
import { POSTS_PER_LOAD } from '../../../environment/config';
import { Post } from '../../../models/types/post';
import { constructFeed } from '../../../lib/lookso/feed/construct-feed';
import { PaginationResponse } from '../../../models/types/pagination';
import { FeedPost } from '../../../models/types/feed-post';
import { getPageToQuery } from '../../utils/get-page-to-query';

/**
 * follow - Adds a follow relationship between two addresses.
 *
 * @param {string} from - The address that is following.
 * @param {string} to - The address being followed.
 * @returns {Promise<{ jsonUrl?: string }>} A promise that resolves to an object with a possible 'jsonUrl' property if the registry change count is about to exceed the max.
 */
const follow = async (from: string, to: string): Promise<{ jsonUrl?: string }> => {
  // Verify the current off-chain changes count for the address
  const registryChangesCount = await verifyOffchainChangesCount(from);

  // Query the contract at the 'to' address and check if it is of type LSP0
  const contract = await queryContract(to);
  if (contract && contract.interfaceCode !== 'LSP0') throw ERROR_NOT_LSP0;

  // Insert follow information
  await insertFollow(from, to);
  await insertRegistryChange(from, 'follow', 'add', to, new Date());
  await insertNotification(to, from, new Date(), 'follow');

  // Create new registry if change count is about to exceed max
  return await createNewRegistryIfCountAboutToExceedMax(registryChangesCount, from);
};

/**
 * unfollow - Delete a follow relationship between two addresses.
 *
 * @param {string} from - The address that is following.
 * @param {string} to - The address being followed.
 * @returns {Promise<{ jsonUrl?: string }>} A promise that resolves to an object with a possible 'jsonUrl' property if the registry change count is about to exceed the max.
 */
const unfollow = async (from: string, to: string): Promise<{ jsonUrl?: string }> => {
  // Verify the current off-chain changes count for the address
  const registryChangesCount = await verifyOffchainChangesCount(from);

  // Query the contract at the 'to' address and check if it is of type LSP0
  const contract = await queryContract(to);
  if (contract && contract.interfaceCode !== 'LSP0') throw ERROR_NOT_LSP0;

  await removeFollow(from, to);
  await insertRegistryChange(from, 'follow', 'remove', to, new Date());

  // Create new registry if change count is about to exceed max
  return await createNewRegistryIfCountAboutToExceedMax(registryChangesCount, from);
};

/**
 * Adds or removes a like for a post.
 *
 * @param {string} from - The address of the user that wants to like or unlike the post
 * @param {string} postHash - The hash of the post to like or unlike
 *
 * @return {Promise<{jsonUrl?: string}>} - A promise that returns an object with a possible `jsonUrl` key
 * that points to the new registry created if the change count is about to exceed the max
 */
const like = async (from: string, postHash: string): Promise<{ jsonUrl?: string }> => {
  // Verify the current off-chain changes count for the address
  const registryChangesCount = await verifyOffchainChangesCount(from);

  // Check if the post has already been liked by the user
  const liked: boolean = await queryPostLike(from, postHash);
  if (liked) {
    // If it has, remove the like and log the change
    await removeLike(from, postHash);
    await insertRegistryChange(from, 'like', 'remove', postHash, new Date());
  } else {
    // If not, add the like and log the change
    await insertLike(from, postHash);
    await insertRegistryChange(from, 'like', 'add', postHash, new Date());
    // Get the post and insert a notification for the post's author
    const post = await queryPost(postHash);
    await insertNotification(post.author, from, new Date(), 'like', post.hash);
  }

  // Create new registry if change count is about to exceed max
  return await createNewRegistryIfCountAboutToExceedMax(registryChangesCount, from);
};

/**
 * Retrieve the feed of posts or events
 *
 * @param {string} queryUrl - the URL being queried
 * @param {'post' | 'event'} postType - type of post, either 'post' or 'event'
 * @param {number} pageFromClient - the page number requested by the client
 * @param {string} viewOf - the address viewing the feed
 *
 * @returns {PaginationResponse & {results: FeedPost[]}} - returns the feed data with pagination information
 */
const getFeed = async (
  queryUrl: string,
  postType?: 'post' | 'event',
  pageFromClient?: number,
  viewOf?: string,
): Promise<PaginationResponse & { results: FeedPost[] }> => {
  // Query the total number of posts or events
  const count = await queryPostsCount(postType);

  // Determine which page to query based on the query URL, client-requested page, and total number of posts or events
  const pageToQuery = getPageToQuery(count, POSTS_PER_LOAD, queryUrl, pageFromClient, true);

  // Query the posts from the database
  const posts: Post[] = await queryPosts(
    POSTS_PER_LOAD,
    pageToQuery.page * POSTS_PER_LOAD,
    postType,
  );

  // Generate the feed based on the posts
  const feed = await constructFeed(posts, viewOf);

  return {
    count,
    results: feed,
    ...pageToQuery,
  };
};

export const looksoService = {
  follow,
  unfollow,
  like,
  getFeed,
};
