import { updateContractName, updateContractSymbol } from '../../../bin/db/contract-metadata.table';
import { INDEX_DATA } from '../config';
import { reportIndexingScriptError } from '../index-logger';

export async function indexUpdateName(address: string, name: string) {
  if (!INDEX_DATA) return;
  try {
    await updateContractName(address, name);
  } catch (e) {
    await reportIndexingScriptError('indexUpdateName', e, { address, name });
  }
}

export async function indexUpdateSymbol(address: string, symbol: string) {
  if (!INDEX_DATA) return;
  try {
    await updateContractSymbol(address, symbol);
  } catch (e) {
    await reportIndexingScriptError('indexUpdateSymbol', e);
  }
}
