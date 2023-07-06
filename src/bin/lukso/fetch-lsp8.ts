import {web3} from '../web3/web3';
import {AbiItem} from 'web3-utils';
import {selectImage} from '../utils/select-image';
import {queryImages} from '../db/image.table';
import {formatUrl} from '../utils/format-url';
import {queryContractMetadata} from '../db/contract-metadata.table';
import ERC725, {ERC725JSONSchema} from '@erc725/erc725.js';
import {TOKEN_ID_TYPE} from '../../models/enums/token-id-type';
import {fetchLsp8TokenInfo} from './fetch-lsp8-token-metadata';
import LSP8IdentifiableDigitalAssetSchema from '../../assets/schemas/LSP8IdentifiableDigitalAssetSchema.json';
import LSP8IdentifiableDigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json';
import {AssetWithBalance} from '../../models/types/asset';
import {SOL_STANDARD} from '../../models/enums/sol-standard';
import {Token} from '../../models/types/token';

/**
 * Fetches all the tokens owned by a user for a given LSP8 contract, along with contract metadata, tokenIdType and image of the contract
 *
 * @param {string} profileAddress - Ethereum address of the user
 * @param {string} assetAddress - Ethereum address of the LSP8 contract
 * @returns {Promise<Object>} - An object containing the contract address, contract name, tokenIdType, tokens information, image and type of the contract
 */
export const fetchLsp8WithOwnedTokens = async (profileAddress: string, assetAddress: string): Promise<AssetWithBalance> => {
	const contractMetadata = await queryContractMetadata(assetAddress);
	const lsp8contract = new web3.eth.Contract(LSP8IdentifiableDigitalAsset.abi as AbiItem[], assetAddress);
	const erc725 = new ERC725(LSP8IdentifiableDigitalAssetSchema as ERC725JSONSchema[], assetAddress, web3.currentProvider);
	const tokenIdType: string = (await erc725.fetchData('LSP8TokenIdType')).value as string || '0';
	const tokens = await lsp8contract.methods.tokenIdsOf(profileAddress).call();
	const promises: Promise<Token>[] = [];
	for (const token of tokens) {
		promises.push(fetchLsp8TokenInfo(assetAddress, token, tokenIdType));
	}
	const tokensInfo = await Promise.all(promises);

	const image = selectImage(await queryImages(assetAddress), {minWidthExpected: 200});
	return {
		address: assetAddress,
		name: contractMetadata.name,
		tokenIdType,
		tokens: tokensInfo,
		image: image ? formatUrl(image.url) : '',
		type: SOL_STANDARD.LSP8
	};
};