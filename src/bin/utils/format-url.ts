import {ARWEAVE_GATEWAY, IPFS_GATEWAY} from "./constants";

export function formatUrl(url: string) {
    if (url.includes('ipfs://')) return url.replace('ipfs://', IPFS_GATEWAY);
    if (url.includes('ar://')) return url.replace('ar://', ARWEAVE_GATEWAY);
    else return url;
}