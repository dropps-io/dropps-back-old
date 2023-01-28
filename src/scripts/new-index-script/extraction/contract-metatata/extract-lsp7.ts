import {LSP4DigitalAsset} from '../../../../bin/UniversalProfile/models/lsp4-digital-asset.model';
import {AbiItem} from 'web3-utils';
import {extractLSP4Data} from './extract-lsp4';
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json';
import {web3} from '../../../../bin/web3/web3';
import {reportIndexingScriptError} from '../../index-logger';
import {ContractFullMetadata} from '../../models/contract-metadata.model';

export async function extractLSP7Data(address: string): Promise<ContractFullMetadata> {
	const lsp4: LSP4DigitalAsset = await extractLSP4Data(address);
	let isNFT = false;
	try {
		const lsp7contract = new web3.eth.Contract(LSP7DigitalAsset.abi as AbiItem[], address);
		isNFT = (await lsp7contract.methods.decimals().call()) === '0';
	} catch (e) {
		await reportIndexingScriptError('extractLSP7Data', e);
	}
	return {
		name: lsp4.name,
		description: lsp4.metadata ? lsp4.metadata.description : '',
		symbol: lsp4.symbol,
		images: lsp4.metadata ? lsp4.metadata.images.flat() : [],
		icon: lsp4.metadata ? lsp4.metadata.icon : [],
		assets: lsp4.metadata ? lsp4.metadata.assets : [],
		tags: [],
		backgroundImage: [],
		profileImage: [],
		links: [],
		isNFT
	};
}