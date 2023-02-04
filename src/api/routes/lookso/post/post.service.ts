import {
  queryPostLike,
  queryPostLikesCount,
  queryPostLikesWithNames,
} from '../../../../lib/db/queries/like.table';
import { API_URL, PROFILES_PER_LOAD } from '../../../../environment/config';
import { ERROR_INVALID_PAGE } from '../../../../lib/utils/error-messages';
import { PaginationResponse } from '../../../../models/types/pagination';
import { getProfilesBasicInfos } from '../../../../lib/db/utils/get-profiles-basic-info';
import { ProfileBasicInfo } from '../../../../models/types/profile-basic-info';

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
export const getPostLikes = async (
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
