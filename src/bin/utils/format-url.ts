export function formatUrl(url: string, ipfsGateway: string) {
    if (url.includes('ipfs://')) return url.replace('ipfs://', ipfsGateway);
    else return url;
}