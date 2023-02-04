import { tryIdentifyingContract } from '../../blockchain-indexing/utils/contract-identification';
import { ContractFullMetadata } from '../models/contract-metadata.model';
import { extractLSP3Data } from './contract-metatata/extract-lsp3';
import { extractLSP8Data } from './contract-metatata/extract-lsp8';
import { extractLSP7Data } from './contract-metatata/extract-lsp7';
import { incrementContractExtractedInLog, reportIndexingScriptError } from '../index-logger';

export async function extractContract(
  address: string,
): Promise<{ metadata: ContractFullMetadata | null; interfaceCode: string | null }> {
  const contractInterface = await tryIdentifyingContract(address);

  let metadata: ContractFullMetadata | null = null;
  try {
    switch (contractInterface?.code) {
      case 'LSP8':
        metadata = await extractLSP8Data(address);
        break;
      case 'LSP7':
        metadata = await extractLSP7Data(address);
        break;
      case 'LSP0':
        metadata = await extractLSP3Data(address);
        break;
    }
  } catch (e) {
    await reportIndexingScriptError('extractContract', e);
  }

  incrementContractExtractedInLog(contractInterface?.code ? contractInterface?.code : 'null');
  return { metadata, interfaceCode: contractInterface?.code ? contractInterface?.code : null };
}
