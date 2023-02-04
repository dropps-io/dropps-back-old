import {
  queryContractName,
  searchContractMetadataByAddress,
  searchContractMetadataByAddressCount,
  searchContractMetadataByName,
  searchContractMetadataByNameCount,
} from '../db/contract-metadata.table';
import { queryImagesByType } from '../db/image.table';
import { selectImage } from '../utils/select-image';
import { PROFILES_PER_SEARCH } from '../../environment/config';
import { ERROR_INVALID_PAGE } from '../utils/error-messages';
import { queryTransaction } from '../db/transaction.table';
import { logError } from '../logger';
import { Transaction } from '../../models/types/transaction';

type SearchResults = {
  profiles: {
    count: number;
    results: { address: string; name: string; image: string }[];
  };
  transactions: { count: number; results: Transaction[] };
};

/**
 * Search for entries in the database with a limit set to 5 per page per category
 * Categories: profiles && transactions
 *
 * @param input to search into the database
 * @param page of the results
 *
 * @return: search results containing profiles and transactions fetched at the provided page
 */
export async function search(input: string, page: number): Promise<SearchResults> {
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
}
