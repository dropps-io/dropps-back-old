import {LSP4DigitalAsset, LSP4DigitalAssetMetadata} from '../UniversalProfile/models/lsp4-digital-asset.model';
import ERC725, {ERC725JSONSchema} from '@erc725/erc725.js';
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import LSP8IdentifiableDigitalAssetSchema from '../../assets/schemas/LSP8IdentifiableDigitalAssetSchema.json';
import {GetDataDynamicKey} from '@erc725/erc725.js/build/main/src/types/GetData';
import {logError} from '../logger';
import {web3} from '../web3/web3';
import {selectImage} from '../utils/select-image';
import {formatUrl} from '../utils/format-url';
import {Token} from '../../models/types/token';
import {getAddress, toUtf8String} from 'ethers';
import {keccak} from 'ethereumjs-util';
import {erc725yGetData} from '../utils/erc725y-get-data';
import {HTTP_RPC, IPFS_GATEWAY} from '../../environment/config';
import {decodeJsonUrl} from '../utils/json-url';

enum LSP8_TOKEN_ID_TYPE {
	unknown = 0,
	address = 1,
	uint256 = 2,
	bytes32 = 3,
	string = 4,
}

/**
 * Fetches the information about an LSP8 token.
 *
 * @param {string} assetAddress - The address of the LSP8 token.
 * @param {string} tokenId - The token id.
 * @param {TOKEN_ID_TYPE} tokenIdType - The type of token id.
 *
 * @returns {Promise<{tokenId:string, decodedTokenId:string, name:string, image:string, description:string, links:string[]}>} - Returns an object containing the tokenId, decodedTokenId, name, image, description, and links of the LSP8 token.
 *
 * @throws {Error} - If an error occurs while fetching the token metadata, the error is logged and the function returns an empty object.
 */
export const fetchLsp8TokenInfo = async (assetAddress: string, tokenId: string, tokenIdType: string): Promise<Token> => {
	const decodedTokenId = decodeLsp8TokenId(tokenId, tokenIdType);
	let tokenMetadata;
	try {
		tokenMetadata = await fetchLsp8TokenMetadata(assetAddress, tokenId, tokenIdType as unknown as LSP8_TOKEN_ID_TYPE);
	} catch (e) {
		logError(e);
	}

	return {
		tokenId,
		decodedTokenId,
		name: tokenMetadata?.name ?? '',
		image: tokenMetadata?.images ? formatUrl(selectImage(tokenMetadata.images, {minWidthExpected: 200})?.url ?? '') : '',
		description: tokenMetadata?.description ?? '',
		links: tokenMetadata?.links ?? []
	};
};

/**
 * Fetches the metadata for a specific LSP8 token

 * @param {string} contractAddress - Address of the LSP8 contract
 * @param {string} tokenId - The tokenId of the token
 * @param {TOKEN_ID_TYPE} tokenIdType - The type of the tokenId
 *
 * @returns {Promise<LSP4DigitalAssetMetadata | null>} - The metadata of the LSP8 token
 */
const fetchLsp8TokenMetadata = async (contractAddress: string, tokenId: string, tokenIdType: LSP8_TOKEN_ID_TYPE): Promise<LSP4DigitalAssetMetadata | null> => {
	const decodedTokenId = decodeLsp8TokenId(tokenId, tokenIdType as any);

	let metadata = await fetchDataFromBaseURI(contractAddress, decodedTokenId);

	if (!metadata)
		metadata = await fetchDataFromMetadataURI(contractAddress, decodedTokenId, tokenIdType);

	if (!metadata)
		metadata = await fetchDataFromMetadataURI(contractAddress, decodedTokenId, tokenIdType, true);

	try {
		return metadata;
	} catch (error) {
		logError(error);
		throw new Error('Unable to fetch lsp4 metadata');
	}
};

const fetchDataFromBaseURI = async (
	address: string,
	decodedTokenId: string,
): Promise<(LSP4DigitalAssetMetadata & { name?: string }) | null> => {
	// Fetch data from the ERC725Y smart contract by providing the hash of 'LSP8TokenMetadataBaseURI'
	const response = await erc725yGetData(address, '0x1a7628600c3bac7101f53697f48df381ddc36b9015e7d7c9c5633d1252aa2843');
	if (!response || response === '0x') return null;

	// Convert the response to a UTF8 string, slicing off the first 10 characters
	const baseURI = toUtf8String('0x' + response.slice(10));

	// Format the token URI by appending the decoded token ID to the base URI
	const tokenURI = `${formatUrl(baseURI)}/${decodedTokenId}`;
	return await fetchLsp4MetadataFromUrl(tokenURI);
};
const fetchDataFromMetadataURI = async (
	address: string,
	decodedTokenId: string,
	tokenIdType: LSP8_TOKEN_ID_TYPE,
	legacy?: boolean,
): Promise<(LSP4DigitalAssetMetadata & { name?: string }) | null> => {
	const tokenMetadataKey: string = getLsp8TokenMetadataKey(tokenIdType, legacy);
	const key = getErc725(address).encodeKeyName(tokenMetadataKey, decodedTokenId);

	const response = await erc725yGetData(address, key);
	if (!response) return null;

	const url = legacy ? decodeJsonUrl(response) : toUtf8String('0x' + response.slice(10));

	return await fetchLsp4MetadataFromUrl(formatUrl(url));
};

const getLsp8TokenMetadataKey = (tokenIdType: number, legacy?: boolean): string => {
	const keyNamePrefix = legacy ? 'LSP8MetadataJSON' : 'LSP8MetadataTokenURI';

	if (tokenIdType === LSP8_TOKEN_ID_TYPE.address) return `${keyNamePrefix}:<address>`;
	else if (tokenIdType === LSP8_TOKEN_ID_TYPE.uint256) return `${keyNamePrefix}:<uint256>`;
	else if (tokenIdType === LSP8_TOKEN_ID_TYPE.string) return `${keyNamePrefix}:<string>`;
	else return `${keyNamePrefix}:<bytes32>`;
};

export const decodeLsp8TokenId = (tokenId: string, tokenIdType?: string): string => {
	if (!tokenIdType) return tokenId;

	switch (parseInt(tokenIdType)) {
	case LSP8_TOKEN_ID_TYPE.address:
		return getAddress(tokenId.slice(0, 42));
	case LSP8_TOKEN_ID_TYPE.uint256:
		return parseInt(tokenId.slice(2), 16).toString(); // Converts hex to decimal string
	case LSP8_TOKEN_ID_TYPE.string:
		return toUtf8String(tokenId);
	case LSP8_TOKEN_ID_TYPE.bytes32:
	default: // When no tokenIdType, we assume it's a bytes32 type
		return tokenId;
	}
};

const fetchLsp4MetadataFromUrl = async (
	url: string,
): Promise<(LSP4DigitalAssetMetadata & { name?: string }) | null> => {
	try {
		// Attempt to fetch the token metadata from the given URL
		const tokenMetadata = await fetch(url);

		// Convert the metadata response to JSON
		const tokenMetadataJson = await tokenMetadata.json();

		// If the metadata JSON doesn't exist or doesn't contain an 'LSP4Metadata' property, return null
		if (!tokenMetadataJson || !tokenMetadataJson.LSP4Metadata) return null;
		// Otherwise, return the 'LSP4Metadata' property of the metadata JSON
		else return tokenMetadataJson.LSP4Metadata;
	} catch (e) {
	// If an error occurs, log a warning with the URL and return null
		return null;
	}
};

const getErc725 = (address: string): ERC725 => {
	return new ERC725(LSP8IdentifiableDigitalAssetSchema as ERC725JSONSchema[], address, HTTP_RPC, {
		ipfsGateway: IPFS_GATEWAY,
	});
};