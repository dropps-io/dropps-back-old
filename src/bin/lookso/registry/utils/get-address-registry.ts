import {UniversalProfileReader} from "../../../UniversalProfile/UniversalProfileReader.class";
import {IPFS_GATEWAY, KEY_LSPXXSocialRegistry} from "../../../utils/constants";
import {web3} from "../../../web3/web3";
import {SocialRegistry} from "../types/social-registry";
import axios from "axios";
import {formatUrl} from "../../../utils/format-url";
import {decodeJsonUrl} from "../../../utils/json-url";

export async function getProfileRegistry(address: string): Promise<SocialRegistry> {
  const universalProfile = new UniversalProfileReader(address, IPFS_GATEWAY, web3);
  const jsonUrl: string = (await universalProfile.getDataUnverified([KEY_LSPXXSocialRegistry]))[0] as string;
  try {
    return (await axios.get(formatUrl(decodeJsonUrl(jsonUrl)))).data as SocialRegistry;
  }
  catch (error:any) {
    if (error.message) console.log("Unable to fetch Social Registry. " + error.message);
    return {posts: [], likes: [], follows: []};
  }
}