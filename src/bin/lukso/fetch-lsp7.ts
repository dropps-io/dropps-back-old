import {web3} from '../web3/web3';
import {AbiItem} from 'web3-utils';
import {selectImage} from '../utils/select-image';
import {queryImages} from '../db/image.table';
import {formatUrl} from '../utils/format-url';
import {queryContractMetadata} from '../db/contract-metadata.table';
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json';

/**
 * Fetches an LSP7 digital asset information with the balance of an address.
 *
 * @param {string} profileAddress - The Ethereum address of the profile for which to fetch balance.
 * @param {string} assetAddress - The Ethereum address of the LSP7 digital asset.
 *
 * @returns {Object} An object containing the following properties:
 * - contractAddress: the Ethereum address of the contract
 * - contractName: the name of the contract
 * - balance: the balance of the profile for this asset (if NFT, the balance is returned as it is. If not, it is divided by 10^18)
 * - image: the image of the contract, in URL format
 * - type: the type of contract ("LSP7")
 */
export const fetchLsp7WithBalance = async (profileAddress: string, assetAddress: string) => {
	const contractMetadata = await queryContractMetadata(assetAddress);
	const lsp7contract = new web3.eth.Contract(LSP7DigitalAsset.abi as AbiItem[], assetAddress);
	const balance = await lsp7contract.methods.balanceOf(profileAddress).call();
	const contractImage = selectImage(await queryImages(assetAddress), {minWidthExpected: 200});
	return{
		contractAddress: assetAddress,
		contractName: contractMetadata.name,
		balance: contractMetadata.isNFT ? balance : (parseInt(balance) / (10**18)).toString(),
		image: contractImage ? formatUrl(contractImage.url) : '',
		type: 'LSP7'
	};
};