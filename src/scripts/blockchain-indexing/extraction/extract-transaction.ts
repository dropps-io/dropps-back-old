import { web3 } from '../../../lib/web3';
import { decodeTransactionFinalInput } from '../utils/tx-final-input';
import { MethodParameterTable } from '../../../models/types/tables/method-parameter-table';
import { queryMethodParameters } from '../../../lib/db/queries/method-parameter.table';
import { Transaction } from '../../../models/types/transaction';
import { incrementExtractedToLogOf, reportIndexingScriptError } from '../index-logger';

export async function extractTransaction(hash: string): Promise<{
  transaction: Transaction;
  params: MethodParameterTable[];
  decodedParams: { [key: string]: any };
}> {
  let transaction: Transaction;
  let decodedParameters: { [key: string]: any } = {};
  let parameters: MethodParameterTable[] = [];
  try {
    transaction = { ...(await web3.eth.getTransaction(hash)), methodId: '', hash };
  } catch (e) {
    await reportIndexingScriptError('extractTransaction', e);
    throw 'Failed to get transaction';
  }
  try {
    const finalInput = decodeTransactionFinalInput(transaction.input);
    parameters = await queryMethodParameters(finalInput.slice(0, 10));
    if (parameters.length > 0) {
      decodedParameters = web3.eth.abi.decodeParameters(parameters, finalInput.slice(10));
      incrementExtractedToLogOf('txParams');
    }
  } catch (e) {
    await reportIndexingScriptError('extractTransaction:params', e);
  }

  incrementExtractedToLogOf('transactions');
  return { transaction, params: parameters, decodedParams: decodedParameters };
}
