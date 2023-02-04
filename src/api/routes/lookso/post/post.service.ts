import sharp from 'sharp';

import {
  queryPostLike,
  queryPostLikesCount,
  queryPostLikesWithNames,
} from '../../../../lib/db/queries/like.table';
import { API_URL, COMMENTS_PER_LOAD, PROFILES_PER_LOAD } from '../../../../environment/config';
import { ERROR_INVALID_PAGE, FILE_TYPE_NOT_SUPPORTED } from '../../../../lib/utils/error-messages';
import { PaginationResponse } from '../../../../models/types/pagination';
import { getProfilesBasicInfos } from '../../../../lib/db/utils/get-profiles-basic-info';
import { ProfileBasicInfo } from '../../../../models/types/profile-basic-info';
import { queryPostComments, queryPostCommentsCount } from '../../../../lib/db/queries/post.table';
import { Post } from '../../../../models/types/post';
import { constructFeed } from '../../../../lib/lookso/feed/construct-feed';
import { FeedPost } from '../../../../models/types/feed-post';
import { uploadToArweave } from '../../../../lib/arweave/utils/uploadToArweave';
import {
  arrayBufferKeccak256Hash,
  objectToBuffer,
  objectToKeccak256Hash,
} from '../../../../lib/utils/file-converters';
import { MetadataAsset } from '../../../../models/types/metadata-objects';
import { LSPXXProfilePost, ProfilePost } from '../../../../lib/lookso/registry/types/profile-post';
import { applyChangesToRegistry } from '../../../../lib/lookso/registry/apply-changes-to-registry';
import { buildJsonUrl } from '../../../../lib/utils/json-url';
import { defaultPaginationResWithResults } from '../../../utils/default-pagination-response';
import { getPageToQuery } from '../../../utils/get-page-to-query';

/**
 * Retrieves information about the likes of a post.
 *
 * @param hash - Hash of the post.
 * @param page - Page number for pagination.
 * @param sender - Sender address for filtering.
 * @param viewOf - Viewer's address for checking if they follow the profiles.
 *
 * @returns Promise that resolves to the pagination response and results.
 */
const getPostLikes = async (
  hash: string,
  page: number,
  sender?: string,
  viewOf?: string,
): Promise<PaginationResponse & { results: string[] | ProfileBasicInfo[] }> => {
  const response: PaginationResponse & { results: string[] | ProfileBasicInfo[] } = {
    count: 0,
    page,
    next: null,
    previous: null,
    results: [],
  };

  if (sender) {
    const isLiking = await queryPostLike(sender, hash);
    if (isLiking) {
      response.count = 1;
      response.results = [sender];
    }
  } else {
    const likesCount = await queryPostLikesCount(hash);
    if (page && page >= likesCount / PROFILES_PER_LOAD) throw ERROR_INVALID_PAGE;
    const likes = await queryPostLikesWithNames(
      hash,
      PROFILES_PER_LOAD,
      page ? page * PROFILES_PER_LOAD : 0,
    );
    response.results = await getProfilesBasicInfos(
      likes.map((l) => l.address),
      viewOf,
      likes.map((l) => l.name),
    );

    const queryUrl = `${API_URL}/lookso/post/${hash}/likes?${
      sender ? 'sender=' + sender + '&' : ''
    }${viewOf ? 'viewOf=' + viewOf + '&' : ''}page=`;

    response.count = likesCount;
    response.next =
      page < Math.ceil(likesCount / PROFILES_PER_LOAD) - 1
        ? queryUrl + (page + 1).toString()
        : null;
    response.previous = page > 0 ? queryUrl + (page - 1).toString() : null;
  }

  return response;
};

/**
 * Retrieve post comments based on a post hash.
 *
 * @param {string} hash - The hash of the post to retrieve comments for.
 * @param {string} queryUrl - The URL for querying post comments.
 * @param {number} pageFromClient - The page number to retrieve from the client. Optional, defaults to the last page.
 * @param {string} viewOf - The address of the user viewing the post, used to determine follow status. Optional.
 *
 */
const getPostComments = async (
  hash: string,
  queryUrl: string,
  pageFromClient?: number,
  viewOf?: string,
): Promise<PaginationResponse & { results: FeedPost[] }> => {
  // Retrieve the count of comments for this post
  const count = await queryPostCommentsCount(hash);
  if (count === 0) return defaultPaginationResWithResults;

  // Determine the page to retrieve, defaulting to the last page
  const pageToQuery = getPageToQuery(count, COMMENTS_PER_LOAD, queryUrl, pageFromClient, true);

  // Retrieve the comments for this page
  const posts: Post[] = await queryPostComments(
    hash,
    COMMENTS_PER_LOAD,
    pageToQuery.page * COMMENTS_PER_LOAD,
  );

  // Convert the post objects to feed post objects, including follow status if specified
  const results = await constructFeed(posts, viewOf, true);

  // Return the result
  return { count, results, ...pageToQuery };
};

/**
 * Process an uploaded file, converting image files to webp format and uploading to Arweave.
 *
 * @param fileBuffer The buffer of the file to be processed.
 * @param fileType The type of the file being uploaded.
 *
 * @throws FILE_TYPE_NOT_SUPPORTED If the file type is not supported.
 *
 * @returns An object with the file type, file URL, hash of the file, and the hash function used.
 */
const processFileUpload = async (
  fileBuffer: Buffer,
  fileType: string,
): Promise<MetadataAsset & { hashFunction: 'keccak256(bytes)' }> => {
  // Start with the original buffer and file type
  let newBuffer = fileBuffer;
  let newFileType = fileType;

  // If the file is an image, convert it to webp format
  if (fileType.includes('image')) {
    newBuffer = await sharp(newBuffer)
      .rotate()
      .resize(800, null, { withoutEnlargement: true, fit: 'contain' })
      .webp({ quality: 50 })
      .toBuffer();
    newFileType = 'image/webp';
  } else {
    // If the file is not an image, throw an error
    throw FILE_TYPE_NOT_SUPPORTED;
  }

  // Upload the processed file
  const fileUrl = await uploadToArweave(newBuffer, newFileType);
  return {
    fileType: newFileType,
    hash: '0x' + arrayBufferKeccak256Hash(newBuffer),
    hashFunction: 'keccak256(bytes)',
    url: fileUrl,
  };
};

/**
 * Uploads a profile post and updates the author's registry.
 *
 * @param {LSPXXProfilePost} profilePost - The profile post to be uploaded.
 * @returns {{jsonUrl: string, postHash: string}} - JSON URL and hash of the uploaded post.
 * @throws {Error} - If there was a problem uploading the post or updating the registry.
 */
const uploadProfilePost = async (
  profilePost: LSPXXProfilePost,
): Promise<{ jsonUrl: string; postHash: string }> => {
  // Convert the profile post to a format that can be uploaded
  const post: ProfilePost = {
    LSPXXProfilePost: profilePost,
    LSPXXProfilePostHash: '0x' + objectToKeccak256Hash(profilePost),
  };

  // Upload the post to Arweave
  const postUrl = await uploadToArweave(objectToBuffer(post), 'application/json');

  // Update the author's registry with the new post
  const registry = await applyChangesToRegistry(profilePost.author);
  registry.posts.push({ url: postUrl, hash: post.LSPXXProfilePostHash });

  // Upload the updated registry to Arweave
  const newRegistryUrl = await uploadToArweave(objectToBuffer(registry), 'application/json');

  return {
    jsonUrl: buildJsonUrl(registry, newRegistryUrl),
    postHash: post.LSPXXProfilePostHash,
  };
};

export const looksoPostService = {
  getPostLikes,
  getPostComments,
  processFileUpload,
  uploadProfilePost,
};
