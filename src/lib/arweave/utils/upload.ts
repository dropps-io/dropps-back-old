import { arweaveTxToUrl } from '../arweave-utils';
import { ArweaveClient } from '../ArweaveClient.class';
import { BundlrClient } from '../BundlrClient.class';
import { logError } from '../../logger';

const arweave = new ArweaveClient();
const bundlr = new BundlrClient();

export async function upload(buffer: Buffer, contentType: string) {
  let postUrl;
  try {
    postUrl = await bundlr.upload(buffer, contentType);
  } catch (error: any) {
    logError(error.message ? error.message : 'Bundlr upload failed');
    try {
      postUrl = await arweave.upload(buffer, contentType);
    } catch (e) {
      throw 'Failed to upload';
    }
  }

  return arweaveTxToUrl(postUrl);
}
