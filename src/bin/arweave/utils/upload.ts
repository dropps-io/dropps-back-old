import {arweaveTxToUrl} from "../arweave-utils";
import {ArweaveClient} from "../ArweaveClient.class";
import {BundlrClient} from "../BundlrClient.class";

const arweave = new ArweaveClient();
const bundlr = new BundlrClient();

export async function upload(buffer: Buffer, contentType: string) {
  let postUrl;
  try {
    postUrl = await bundlr.upload(buffer, contentType);
  } catch (error:any) {
    console.error(error.message? error.message : "Bundlr upload failed");
    try {
      postUrl = arweaveTxToUrl(await arweave.upload(buffer, contentType));
    } catch (e) {
      throw 'Failed to upload';
    }
  }
  return postUrl
}