import {
  queryContractName, searchContractMetadataByAddress, searchContractMetadataByAddressCount, searchContractMetadataByName, searchContractMetadataByNameCount
} from "../db/contract-metadata.table";
import {queryImagesByType} from "../db/image.table";
import {selectImage} from "../utils/select-image";
import {PROFILES_PER_SEARCH} from "../../environment/config";
import {ERROR_INVALID_PAGE} from "../utils/error-messages";

export async function search(input: string, page: number): Promise<{ count: number, results: {address: string, name: string, image: string }[]}> {
  if (page < 0) throw ERROR_INVALID_PAGE;
  // If input is an address
  if (input.length > 2 && input.slice(0, 2) === '0x') {
    // If the address is not too long
    if (input.length < 42) {
      const response = [];
      const contractsCount = await searchContractMetadataByAddressCount(input);
      if (page > contractsCount / PROFILES_PER_SEARCH) throw ERROR_INVALID_PAGE;
      const contracts = await searchContractMetadataByAddress(input, PROFILES_PER_SEARCH, page * PROFILES_PER_SEARCH);
      for (const contract of contracts) {
        const images = await queryImagesByType(contract.address, 'profile');
        response.push({...contract, image: images.length > 0 ? selectImage(images, {minWidthExpected: 50}).url : ''});
      }
      return {
        count: contractsCount,
        results: response
      };
    }
    // If complete address
    else if (input.length === 42) {
      try {
        const name = await queryContractName(input);
        const images = await queryImagesByType(input, 'profile');
        return {
          count: 1,
          results: [{address: input, name: name, image: images.length > 0 ? selectImage(images, {minWidthExpected: 50}).url : ''}]
        }
      } catch (e) {
        throw e;
      }
    }
    else {
      return {
        count: 0,
        results: []
      };
    }
  } else {
    const response = [];
    const contractsCount = await searchContractMetadataByNameCount(input);
    if (page > contractsCount / PROFILES_PER_SEARCH) throw ERROR_INVALID_PAGE;
    const contracts = await searchContractMetadataByName(input, PROFILES_PER_SEARCH, page * PROFILES_PER_SEARCH);
    for (const contract of contracts) {
      const images = await queryImagesByType(contract.address, 'profile');
      response.push({...contract, image: images.length > 0 ? selectImage(images, {minWidthExpected: 50}).url : ''});
    }
    return {
      count: contractsCount,
      results: response
    };
  }
}