import {TOKEN_ID_TYPE} from '../../models/enums/token-id-type';
import {LSP4DigitalAssetMetadata} from '../UniversalProfile/models/lsp4-digital-asset.model';
import ERC725, {ERC725JSONSchema} from '@erc725/erc725.js';
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import LSP8IdentifiableDigitalAssetSchema from '../../assets/schemas/LSP8IdentifiableDigitalAssetSchema.json';
import {GetDataDynamicKey} from '@erc725/erc725.js/build/main/src/types/GetData';
import {logError} from '../logger';
import {web3} from '../web3/web3';
import {selectImage} from '../utils/select-image';
import {formatUrl} from '../utils/format-url';

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
export const fetchLsp8TokenInfo = async (assetAddress: string, tokenId: string, tokenIdType: TOKEN_ID_TYPE) => {
	let decodedTokenId = tokenId;
	if (tokenIdType === TOKEN_ID_TYPE.address) {
		decodedTokenId = tokenId.slice(0, 42);
	} else if (tokenIdType === TOKEN_ID_TYPE.uint256) {
		decodedTokenId = parseInt(tokenId.slice(2), 16).toString();
	}
	let tokenMetadata;
	try {
		tokenMetadata = await fetchLsp8TokenMetadata(assetAddress, tokenId, tokenIdType);
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
const fetchLsp8TokenMetadata = async (contractAddress: string, tokenId: string, tokenIdType: TOKEN_ID_TYPE): Promise<LSP4DigitalAssetMetadata | null> => {
	const erc725 = new ERC725(LSP8IdentifiableDigitalAssetSchema.concat(LSP4DigitalAssetSchema) as ERC725JSONSchema[], contractAddress, web3.currentProvider);

	let tokenMetadataKey: GetDataDynamicKey;

	switch (tokenIdType) {
	case TOKEN_ID_TYPE.address:
		tokenMetadataKey = {
			keyName: 'LSP8MetadataJSON:<address>',
			dynamicKeyParts: tokenId.slice(0, 42),
		};
		break;
	case TOKEN_ID_TYPE.uint256:
		tokenMetadataKey = {
			keyName: 'LSP8MetadataJSON:<uint256>',
			dynamicKeyParts: parseInt(tokenId.slice(2), 16).toString(),
		};
		break;
	case TOKEN_ID_TYPE.bytes32:
	default: // When no tokenIdType, we assume it's a bytes32 type
		tokenMetadataKey = {
			keyName: 'LSP8MetadataJSON:<bytes32>',
			dynamicKeyParts: tokenId,
		};
		break;
	}

	try {
		return ((await erc725.fetchData(tokenMetadataKey)).value as any).LSP4Metadata as LSP4DigitalAssetMetadata;
	} catch (error) {
		logError(error);
		throw new Error('Unable to fetch lsp4 metadata');
	}
};