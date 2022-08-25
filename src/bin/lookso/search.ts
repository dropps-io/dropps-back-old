import {queryContractName, searchContractMetadataByAddress, searchContractMetadataByName} from "../db/contract-metadata.table";
import {queryImagesByType} from "../db/image.table";
import {selectImage} from "../utils/select-image";

export async function search(input: string, limit: number, offset: number): Promise<{address: string, name: string, image: string}[]> {
  if (input.length > 2 && input.slice(0, 2) === '0x') {
    if (input.length < 42) {
      const response = [];
      const contracts = await searchContractMetadataByAddress(input, 5, 0);
      for (const contract of contracts) {
        const images = await queryImagesByType(contract.address, 'profile');
        response.push({...contract, image: images.length > 0 ? selectImage(images, {minWidthExpected: 50}).url : ''});
      }
      return response;
    }
    else if (input.length === 42) {
      try {
        const name = await queryContractName(input);
        const images = await queryImagesByType(input, 'profile');
        return [{
          address: input,
          name: name,
          image: images.length > 0 ? selectImage(images, {minWidthExpected: 50}).url : ''
        }]
      } catch (e) {
        return []
      }
    }
    else {
      return [];
    }
  } else {
    const response = [];
    const contracts = await searchContractMetadataByName(input, limit, offset);
    for (const contract of contracts) {
      const images = await queryImagesByType(contract.address, 'profile');
      response.push({...contract, image: images.length > 0 ? selectImage(images, {minWidthExpected: 50}).url : ''});
    }
    return response;
  }
}