import {queryContract} from '../../../bin/db/contract.table';
import {tryIdentifyingContract} from '../utils/contract-identification';
import {extractLSP8Data} from './contract-metatata/extract-lsp8';
import {extractLSP7Data} from './contract-metatata/extract-lsp7';
import {extractLSP3Data} from './contract-metatata/extract-lsp3';
import {indexContract} from '../data-indexing/index-contract';
import {logError} from '../../../bin/logger';

export async function extractContract(address: string) {
	const contract = await queryContract(address);
	if (contract) return contract;
	const contractInterface = await tryIdentifyingContract(address);

	await indexContract(address, contractInterface?.code ? contractInterface?.code : null);

	try {
		switch (contractInterface?.code) {
		case 'LSP8':
			await extractLSP8Data(address);
			break;
		case 'LSP7':
			await extractLSP7Data(address);
			break;
		case 'LSP0':
			await extractLSP3Data(address);
			break;
		}
	} catch (e) {
		logError(e);
	}
	return {address, interfaceCode: contractInterface?.code ? contractInterface?.code : null};
}