import { ERROR_INVALID_PAGE } from '../../../../lib/utils/error-messages';
import {
  queryContractName,
  searchContractMetadataByAddress,
  searchContractMetadataByAddressCount,
  searchContractMetadataByName,
  searchContractMetadataByNameCount,
} from '../../../../lib/db/queries/contract-metadata.table';
import { PROFILES_PER_SEARCH } from '../../../../environment/config';
import { queryImagesByType } from '../../../../lib/db/queries/image.table';
import { selectImage } from '../../../../lib/utils/select-image';
import { queryTransaction } from '../../../../lib/db/queries/transaction.table';
import { logError } from '../../../../lib/logger';
import { SearchResults } from './search.model';

// TODO improve this service: remove the pagination from the generic search route, add routes or filters for specific search with pagination (TX, profiles, assets, etc)

/**
 * Search for entries in the database with a limit set to 5 per page per category
 * Categories: profiles && transactions
 *
 * @param input to search into the database
 * @param page of the results
 *
 * @return: search results containing profiles and transactions fetched at the provided page
 */
const search = async (input: string, page: number): Promise<SearchResults> => {
  if (page < 0) throw ERROR_INVALID_PAGE;
  // If input is an address
  if (input.length > 2 && input.length <= 42 && input.slice(0, 2) === '0x') {
    // If the address is not too long
    if (input.length < 42) {
      const response = [];
      const contractsCount = await searchContractMetadataByAddressCount(input, 'LSP0');
      if (page >= contractsCount / PROFILES_PER_SEARCH) throw ERROR_INVALID_PAGE;
      const contracts = await searchContractMetadataByAddress(
        input,
        'LSP0',
        PROFILES_PER_SEARCH,
        page * PROFILES_PER_SEARCH,
      );
      for (const contract of contracts) {
        const images = await queryImagesByType(contract.address, 'profile');
        response.push({
          ...contract,
          image: images.length > 0 ? selectImage(images, { minWidthExpected: 50 }).url : '',
        });
      }
      return {
        profiles: {
          count: contractsCount,
          results: response,
        },
        transactions: {
          count: 0,
          results: [],
        },
      };
    }
    // If complete address
    else if (input.length === 42) {
      try {
        const name = await queryContractName(input);
        const images = await queryImagesByType(input, 'profile');
        return {
          profiles: {
            count: 1,
            results: [
              {
                address: input,
                name: name,
                image: images.length > 0 ? selectImage(images, { minWidthExpected: 50 }).url : '',
              },
            ],
          },
          transactions: { count: 0, results: [] },
        };
      } catch (e) {
        throw e;
      }
    } else {
      return { profiles: { count: 0, results: [] }, transactions: { count: 0, results: [] } };
    }
  } else if (input.length === 66 && input.slice(0, 2) === '0x') {
    try {
      const tx = await queryTransaction(input);
      return { profiles: { count: 0, results: [] }, transactions: { count: 1, results: [tx] } };
    } catch (e) {
      logError(e);
      return { profiles: { count: 0, results: [] }, transactions: { count: 0, results: [] } };
    }
  } else {
    const response = [];
    const contractsCount = await searchContractMetadataByNameCount(input, 'LSP0');
    if (page >= contractsCount / PROFILES_PER_SEARCH) throw ERROR_INVALID_PAGE;
    const contracts = await searchContractMetadataByName(
      input,
      'LSP0',
      PROFILES_PER_SEARCH,
      page * PROFILES_PER_SEARCH,
    );
    for (const contract of contracts) {
      const images = await queryImagesByType(contract.address, 'profile');
      response.push({
        ...contract,
        image: images.length > 0 ? selectImage(images, { minWidthExpected: 50 }).url : '',
      });
    }
    return {
      profiles: {
        count: contractsCount,
        results: response,
      },
      transactions: { count: 0, results: [] },
    };
  }
};

export const looksoSearchService = {
  search,
};
