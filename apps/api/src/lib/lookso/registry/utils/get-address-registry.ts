import axios from 'axios';

import { UniversalProfileReader } from '../../../UniversalProfile/UniversalProfileReader.class';
import { KEY_LSPXXSocialRegistry } from '../../../utils/constants';
import { web3 } from '../../../web3';
import { SocialRegistry } from '../types/social-registry';
import { formatUrl } from '../../../utils/format-url';
import { decodeJsonUrl } from '../../../utils/json-url';
import { IPFS_GATEWAY } from '../../../../environment/config';
import { querySenderLikes } from '../../../db/queries/like.table';
import { queryFollowing } from '../../../db/queries/follow.table';

export async function getProfileRegistry(address: string): Promise<SocialRegistry> {
  const universalProfile = new UniversalProfileReader(address, IPFS_GATEWAY, web3);
  const unverifiedData = await universalProfile.getDataUnverified([KEY_LSPXXSocialRegistry]);
  const jsonUrl: string = unverifiedData[0] as string;
  try {
    const registry = (await axios.get(formatUrl(decodeJsonUrl(jsonUrl)))).data as any;
    return {
      posts: registry.posts ? registry.posts : [],
      likes: registry.likes ? registry.likes : [],
      follows: registry.follows ? registry.follows : [],
    };
  } catch (error: any) {
    if (error.message.includes('Cannot read properties of null'))
      return { posts: [], likes: [], follows: [] };
    else if (error.message.includes('unescaped')) {
      // TODO also fetch the posts (to do so we need to save the posts URLs when we fetch them)
      const likes = await querySenderLikes(address);
      const following = await queryFollowing(address);
      return { posts: [], likes: likes, follows: following };
    } else throw error;
  }
}
