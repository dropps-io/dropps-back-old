import config from 'config';

export const ENV = config.get('env');
export const JWT_VALIDITY_TIME: number = config.get('jwt_validity_time');
export const LOGGER: boolean = config.get('logger');
export const MAX_IMAGE_SIZE: boolean = config.get('max_image_size');
export const POST_VALIDATOR_ADDRESS: string[] = config.get('post_validator_address');
export const HTTP_RPC: string = config.get('http_rpc');
export const PORT: string = config.get('port');
export const API_URL: string = config.get('api_url');

export const MAX_OFFCHAIN_REGISTRY_CHANGES = 30;
export const POSTS_PER_LOAD = 30;
export const PROFILES_PER_LOAD = 50;
export const IPFS_GATEWAY = 'https://2eff.lukso.dev/ipfs/';
export const ARWEAVE_GATEWAY = 'https://arweave.net/';
