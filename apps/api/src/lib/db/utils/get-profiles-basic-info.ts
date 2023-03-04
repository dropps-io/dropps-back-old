import { queryContractName } from '../queries/contract-metadata.table';
import { queryImagesByType } from '../queries/image.table';
import { queryFollow } from '../queries/follow.table';
import { selectImage } from '../../utils/select-image';
import { ProfileBasicInfo } from '../../../models/types/profile-basic-info';

/**
 * Returns an array of profile basic information, including profile images and follow status.
 *
 * @param {string[]} addresses - Array of addresses of profiles.
 * @param {string} [viewOf] - Address of the viewer to determine follow status.
 * @param {string[]} [names] - Array of names for the profiles. Must have the same length as the addresses array.
 *
 * @returns {Promise<ProfileBasicInfo[]>} - Array of profile basic information.
 *
 * @throws {string} - Error message 'Not the same number of names and addresses' if the length of the `names` array does not match the length of the `addresses` array.
 */
export const getProfilesBasicInfos = async (
  addresses: string[],
  viewOf?: string,
  names?: string[],
): Promise<ProfileBasicInfo[]> => {
  if (names && names.length !== addresses.length)
    throw 'Not the same number of names and addresses';
  const results: ProfileBasicInfo[] = [];

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    const name = names ? names[i] : await queryContractName(address);
    const images = await queryImagesByType(address, 'profile');
    const following = viewOf ? await queryFollow(viewOf, address) : undefined;
    const image = selectImage(images, { minWidthExpected: 50 });
    results.push({ address, name, image: image ? image.url : '', following });
  }

  return results;
};
