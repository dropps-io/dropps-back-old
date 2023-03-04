import {
  queryPostsOfUser,
  queryPostsOfUserCount,
  queryPostsOfUsers,
  queryPostsOfUsersCount,
} from '../../../../lib/db/queries/post.table';
import {
  IPFS_GATEWAY,
  NOTIFICATIONS_PER_LOAD,
  POSTS_PER_LOAD,
  PROFILES_PER_LOAD,
} from '../../../../environment/config';
import { ERROR_NOT_FOUND } from '../../../../lib/utils/error-messages';
import { Post } from '../../../../models/types/post';
import { constructFeed } from '../../../../lib/lookso/feed/construct-feed';
import { FeedPost } from '../../../../models/types/feed-post';
import {
  queryFollow,
  queryFollowersCount,
  queryFollowersWithNames,
  queryFollowing,
  queryFollowingCount,
  queryFollowingWithNames,
} from '../../../../lib/db/queries/follow.table';
import {
  queryContractMetadata,
  queryContractName,
} from '../../../../lib/db/queries/contract-metadata.table';
import { logError } from '../../../../lib/logger';
import { queryTags } from '../../../../lib/db/queries/tag.table';
import { queryLinks } from '../../../../lib/db/queries/link.table';
import { queryImages, queryImagesByType } from '../../../../lib/db/queries/image.table';
import { selectImage } from '../../../../lib/utils/select-image';
import { GetProfileResponse } from './profile.model';
import { getPageToQuery } from '../../../utils/get-page-to-query';
import { PaginationResponse } from '../../../../models/types/pagination';
import { defaultPaginationResWithResults } from '../../../utils/default-pagination-response';
import { ProfileBasicInfo } from '../../../../models/types/profile-basic-info';
import { UniversalProfileReader } from '../../../../lib/UniversalProfile/UniversalProfileReader.class';
import { web3 } from '../../../../lib/web3';
import { AssetWithBalance } from '../../../../models/types/asset';
import { queryContract } from '../../../../lib/db/queries/contract.table';
import { fetchLsp7WithBalance } from '../../../../lib/lukso/fetch-lsp7';
import { fetchLsp8WithOwnedTokens } from '../../../../lib/lukso/fetch-lsp8';
import {
  queryNotificationsCountOfAddress,
  queryNotificationsOfAddress,
} from '../../../../lib/db/queries/notification.table';
import { NotificationWithSenderDetails } from '../../../../models/types/notification';

/**
 * Get profile activity of a given user.
 *
 * @param {string} address - The address of the user.
 * @param {string} queryUrl - The URL of the query.
 * @param {'event' | 'post'} [postType] - The type of post to retrieve.
 * @param {number} [pageFromClient] - The page number of posts to retrieve from the client.
 * @param {string} [viewOf] - The address of the viewer.
 *
 * @returns {Promise<PaginationResponse & { results: FeedPost[] }>}
 * The response with the total count of posts, the queried page number and the results in the form of FeedPost.
 */
const getProfileActivity = async (
  address: string,
  queryUrl: string,
  postType?: 'event' | 'post',
  pageFromClient?: number,
  viewOf?: string,
): Promise<PaginationResponse & { results: FeedPost[] }> => {
  // Query the total count of posts of a given user with a specific post type
  const count = await queryPostsOfUserCount(address, postType);
  // If there are no posts, return an empty pagination response with results
  if (count === 0) return defaultPaginationResWithResults;

  // Get the page number to query
  const pageToQuery = getPageToQuery(count, POSTS_PER_LOAD, queryUrl, pageFromClient, true);
  // Query the posts of a given user with a specific post type and limit
  const posts = await queryPostsOfUser(
    address,
    POSTS_PER_LOAD,
    pageToQuery.page * POSTS_PER_LOAD,
    postType,
  );
  // Construct the feed of the posts
  const results = await constructFeed(posts, viewOf);
  // Return the response with the count, page, and results
  return { count, ...pageToQuery, results };
};

/**
 * Get profile feed of a given user.
 *
 * @param {string} address - The address of the user.
 * @param {string} queryUrl - The URL of the query.
 * @param {'event' | 'post'} [postType] - The type of post to retrieve.
 * @param {number} [pageFromClient] - The page number of posts to retrieve from the client.
 *
 * @returns {Promise<PaginationResponse & { results: FeedPost[] }>}
 * The response with the total count of posts, the queried page number and the results in the form of FeedPost.
 */
const getProfileFeed = async (
  address: string,
  queryUrl: string,
  postType?: 'event' | 'post',
  pageFromClient?: number,
): Promise<PaginationResponse & { results: FeedPost[] }> => {
  // Query the following list of a given user
  const followingList = await queryFollowing(address);
  // If the user does not follow anyone, return an empty pagination response with results
  if (followingList.length === 0) return defaultPaginationResWithResults;

  // Query the total count of posts of the users that the given user follows with a specific post type
  const count = await queryPostsOfUsersCount(followingList, postType);
  if (count === 0) return defaultPaginationResWithResults;

  const pageToQuery = getPageToQuery(count, POSTS_PER_LOAD, queryUrl, pageFromClient, true);

  const posts: Post[] = await queryPostsOfUsers(
    followingList,
    POSTS_PER_LOAD,
    pageToQuery.page * POSTS_PER_LOAD,
    postType,
  );

  const results = await constructFeed(posts, address);

  return { ...pageToQuery, results, count };
};

/**
 * Get profile information of a given user.
 *
 * @param {string} address - The address of the user.
 *
 * @returns {Promise<GetProfileResponse>}
 * Profile information of the user in the form of GetProfileResponse.
 */
const getProfile = async (address: string): Promise<GetProfileResponse> => {
  let metadata;
  try {
    metadata = await queryContractMetadata(address);
  } catch (e) {
    logError(e);
    throw ERROR_NOT_FOUND;
  }

  const tags = await queryTags(address);
  const links = await queryLinks(address);
  const images = await queryImages(address);
  const backgroundImage = selectImage(
    images.filter((i) => i.type === 'background'),
    { minWidthExpected: 1900 },
  );
  // Select the profile image
  const profileImage = selectImage(
    images.filter((i) => i.type === 'profile'),
    { minWidthExpected: 210 },
  );

  return {
    address: metadata.address,
    name: metadata.name,
    // Map the links into the required format
    links: links.map((l) => {
      return { title: l.title, url: l.url };
    }),
    tags,
    description: metadata.description,
    profileImage: profileImage ? profileImage.url : '',
    backgroundImage: backgroundImage ? backgroundImage.url : '',
  };
};

/**
 * getProfileFollowers is a utility function that retrieves information about the followers of a profile.
 *
 * @param {string} address - The address of the profile whose followers are to be retrieved.
 * @param {string} queryUrl - Base URL for querying pages.
 * @param {number} [pageFromClient] - Page number requested by the client.
 * @param {string} [follower] - If provided, only information about this specific follower will be retrieved.
 * @param {string} [viewOf] - If provided, will check if this profile is following the returned followers.
 *
 * @returns {Promise<PaginationResponse & { results: string[] | ProfileBasicInfo[] }>} - Returns a promise that, when resolved, returns an object with the number of followers, the current page number, the next and previous page URLs, and an array of followers' information.
 */
const getProfileFollowers = async (
  address: string,
  queryUrl: string,
  pageFromClient?: number,
  follower?: string,
  viewOf?: string,
): Promise<PaginationResponse & { results: string[] | ProfileBasicInfo[] }> => {
  if (follower) {
    const isFollower = await queryFollow(follower, address);

    // If `follower` is following `address`, return the response with just `follower`
    if (isFollower) {
      return {
        count: 1,
        page: 0,
        next: null,
        previous: null,
        results: [follower],
      };
    } else {
      return defaultPaginationResWithResults;
    }
  } else {
    const count = await queryFollowersCount(address);
    const pageToQuery = getPageToQuery(count, PROFILES_PER_LOAD, queryUrl, pageFromClient);

    const followers = await queryFollowersWithNames(
      address,
      PROFILES_PER_LOAD,
      pageToQuery.page * PROFILES_PER_LOAD,
    );

    // Build the response array with the followers' information
    const profiles: ProfileBasicInfo[] = [];
    for (const follower of followers) {
      const images = await queryImagesByType(follower.address, 'profile');
      const selectedImage = selectImage(images, { minWidthExpected: 50 });
      const following = viewOf ? await queryFollow(viewOf, follower.address) : undefined;
      profiles.push({
        ...follower,
        image: selectedImage ? selectedImage.url : '',
        following,
      });
    }

    return {
      count,
      ...pageToQuery,
      results: profiles,
    };
  }
};

/**
 * Get the profile follow list with address, name, and profile pictures.
 *
 * @param {string} address - The address of the profile.
 * @param {string} queryUrl - The URL for the API call.
 * @param {number} [pageFromClient] - The page number from the client.
 * @param {string} [viewOf] - The address of the profile viewing the follow list.
 *
 * @returns {Promise<PaginationResponse & { results: string[] | ProfileBasicInfo[] }>}
 * A promise that resolves to the profile follow list, with the total count,
 * the next and previous page URLs, and the results, which is an array of the profiles
 * being followed.
 */
const getProfileFollowing = async (
  address: string,
  queryUrl: string,
  pageFromClient?: number,
  viewOf?: string,
): Promise<PaginationResponse & { results: string[] | ProfileBasicInfo[] }> => {
  // Query the count of profiles being followed
  const count = await queryFollowingCount(address);
  // Get the page number to query, taking into account the total count and the page from the client
  const pageToQuery = getPageToQuery(count, PROFILES_PER_LOAD, queryUrl, pageFromClient);

  // Query the profiles being followed, with their names
  const following = await queryFollowingWithNames(
    address,
    PROFILES_PER_LOAD,
    pageToQuery.page * PROFILES_PER_LOAD,
  );

  // For each profile being followed, get the profile picture and determine if the viewing profile is following it
  const profiles: ProfileBasicInfo[] = [];
  for (const followingProfile of following) {
    const images = await queryImagesByType(followingProfile.address, 'profile');
    const selectedImage = selectImage(images, { minWidthExpected: 50 });
    const following = viewOf ? await queryFollow(viewOf, followingProfile.address) : undefined;
    profiles.push({
      ...followingProfile,
      image: selectedImage ? selectedImage.url : '',
      following,
    });
  }

  // Return the profile follow list, with the total count, the next and previous page URLs, and the results
  return {
    count,
    ...pageToQuery,
    results: profiles,
  };
};

/**
 * Retrieve all assets associated with a profile and the balance of those assets.
 *
 * @param {string} address - The Ethereum address of the profile to retrieve assets from.
 *
 * @returns {Promise<AssetWithBalance[]>} An array of assets and their balances.
 */
const getProfileAssets = async (address: string): Promise<AssetWithBalance[]> => {
  const profile = new UniversalProfileReader(address, IPFS_GATEWAY, web3);

  // Fetch the 'LSP5ReceivedAssets' field from the profile (contracts where assets were sent to this address)
  const res = await profile.fetchData(['LSP5ReceivedAssets[]']);
  const assets: string[] = res[0].value as string[];

  const promises: Promise<AssetWithBalance>[] = [];
  for (const asset of assets) {
    // Query the contract associated with the asset
    const contract = await queryContract(asset);

    // Based on the interface code of the contract, call either fetchLsp7WithBalance or fetchLsp8WithOwnedTokens
    switch (contract.interfaceCode) {
      case 'LSP7':
        promises.push(fetchLsp7WithBalance(address, asset));
        break;
      case 'LSP8':
        promises.push(fetchLsp8WithOwnedTokens(address, asset));
        break;
    }
  }

  return await Promise.all(promises);
};

/**
 * Retrieve the notifications of a profile.
 *
 * @param {string} address - The address of the profile.
 * @param {string} queryUrl - The query URL.
 * @param {number} [pageFromClient] - The page number from the client.
 *
 * @returns {Promise<PaginationResponse & {results: NotificationWithSenderDetails[]}>}
 * A promise that returns a pagination response object containing an array of notifications with sender details.
 */
const getProfileNotifications = async (
  address: string,
  queryUrl: string,
  pageFromClient?: number,
): Promise<PaginationResponse & { results: NotificationWithSenderDetails[] }> => {
  const count = await queryNotificationsCountOfAddress(address);
  const pageToQuery = getPageToQuery(count, NOTIFICATIONS_PER_LOAD, queryUrl, pageFromClient, true);

  const notifications = await queryNotificationsOfAddress(
    address,
    NOTIFICATIONS_PER_LOAD,
    pageToQuery.page * NOTIFICATIONS_PER_LOAD,
  );

  const notificationsWithSenderDetails: NotificationWithSenderDetails[] = [];
  for (const notification of notifications) {
    let name: string;
    try {
      name = await queryContractName(notification.sender);
    } catch (e) {
      name = '';
    }
    const images = await queryImagesByType(notification.sender, 'profile');
    notificationsWithSenderDetails.push({
      address: notification.address,
      date: notification.date,
      postHash: notification.postHash,
      viewed: notification.viewed,
      type: notification.type,
      sender: {
        address: notification.sender,
        name: name,
        image: images.length > 0 ? selectImage(images, { minWidthExpected: 50 }).url : '',
      },
    });
  }

  return {
    count,
    results: notificationsWithSenderDetails,
    ...pageToQuery,
  };
};

export const looksoProfileService = {
  getProfileActivity,
  getProfileFeed,
  getProfile,
  getProfileFollowers,
  getProfileFollowing,
  getProfileAssets,
  getProfileNotifications,
};
