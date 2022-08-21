import {UniversalProfileReader} from "../../../UniversalProfile/UniversalProfileReader.class";
import {IPFS_GATEWAY} from "../../../utils/constants";
import {web3} from "../../../web3/web3";
import {URLDataWithHash} from "@erc725/erc725.js/build/main/src/types/encodeData/JSONURL";
import {ArweaveClient} from "../../../arweave/ArweaveClient.class";
import {Registry} from "../Registry.class";

const arweave = new ArweaveClient();

export async function getProfileRegistry(address: string): Promise<Registry> {
  const universalProfile = new UniversalProfileReader(address, IPFS_GATEWAY, web3);
  const data = await universalProfile.getDataUnverified([web3.utils.keccak256("LSPXXPostRegistry")]);
  let urlObject = (data[0].value as URLDataWithHash);
  let registryId = urlObject ? urlObject.url.slice(5) : '';

  if (!registryId) return new Registry();

  try {
    let registryJson = await arweave.downloadJson(registryId);
    return new Registry(registryJson);
  }
  catch (error:any) {
    if (error.message) console.log("Unable to fetch Social Registry. " + error.message);
    return new Registry();
  }
}