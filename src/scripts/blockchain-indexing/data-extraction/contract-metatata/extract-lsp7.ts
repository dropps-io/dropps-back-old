import {LSP4DigitalAsset} from '../../../../bin/UniversalProfile/models/lsp4-digital-asset.model';
import {AbiItem} from 'web3-utils';
import {extractLSP4Data} from './extract-lsp4';
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json';
import {indexLSP4Data} from '../../data-indexing/contract-metadata/index-lsp4';
import {web3} from '../../../../bin/web3/web3';

export async function extractLSP7Data(address: string): Promise<void> {
	const lsp4: LSP4DigitalAsset = await extractLSP4Data(address);
	const lsp7contract = new web3.eth.Contract(LSP7DigitalAsset.abi as AbiItem[], address);
	const isNFT: boolean = (await lsp7contract.methods.decimals().call()) === '0';

	await indexLSP4Data(address, lsp4, isNFT, '0');
}