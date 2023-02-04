import { ERROR_INVALID_PAGE } from '../../lib/utils/error-messages';

/**
 * getPageToQuery is a utility function that calculates and returns the current page number, and URLs for the next and previous pages.
 *
 * @param {number} count - Total number of items.
 * @param {number} limit - Maximum number of items to display per page.
 * @param {string} queryUrl - Base URL for querying pages.
 * @param {number} pageFromClient - Page number requested by the client.
 * @param {boolean} defaultLastPage - A flag indicating whether to default to the last page if no page is specified by the client.
 *
 * @throws {ERROR_INVALID_PAGE} - Thrown when the page number requested by the client is invalid.
 *
 * @returns {{ page: number; next: string | null; previous: string | null }} - Returns an object with the current page number and URLs for the next and previous pages.
 */
export const getPageToQuery = (
  count: number,
  limit: number,
  queryUrl: string,
  pageFromClient?: number,
  defaultLastPage?: boolean,
): { page: number; next: string | null; previous: string | null } => {
  let page: number;

  // Determine the current page number
  if (pageFromClient === undefined) {
    page = defaultLastPage ? Math.ceil(count / limit) - 1 : 0;
  } else {
    page = pageFromClient;
  }

  // If the requested page is greater than or equal to the total number of pages, throw an error
  if (page >= count / limit) {
    throw ERROR_INVALID_PAGE;
  }

  // Calculate and return the current page number, next page URL, and previous page URL
  return {
    page,
    next: page < Math.ceil(count / limit) - 1 ? `${queryUrl}${page + 1}` : null,
    previous: page > 0 ? `${queryUrl}${page - 1}` : null,
  };
};
