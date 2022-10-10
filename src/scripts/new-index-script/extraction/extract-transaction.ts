import {web3} from "../../../bin/web3/web3";
import {decodeTransactionFinalInput} from "../../blockchain-indexing/utils/tx-final-input";
import {MethodParameter} from "../../../models/types/method-parameter";
import {queryMethodParameters} from "../../../bin/db/method-parameter.table";
import {Transaction} from "../../../models/types/transaction";
import {Log} from "../../../models/types/log";
import {incrementExtractedToLogOf, reportIndexingScriptError} from "../index-logger";

export async function extractTransaction(log: Log): Promise<{transaction: Transaction, params: { [key: string]: any }}> {
  let transaction: Transaction;
  let decodedParameters: { [key: string]: any; } = {};
  try {
    transaction = {...await web3.eth.getTransaction(log.transactionHash), methodId: ''};
    transaction.input = decodeTransactionFinalInput(transaction.input);
  } catch (e) {
    await reportIndexingScriptError('extractTransaction', e);
    throw 'Failed to get transaction';
  }
  try {
    const parameters: MethodParameter[] = await queryMethodParameters(transaction.input.slice(0, 10));
    if (parameters.length > 0) {
      decodedParameters = web3.eth.abi.decodeParameters(parameters, transaction.input.slice(10));
      incrementExtractedToLogOf('txParams');
    }
  }
  catch (e) {
    await reportIndexingScriptError('extractTransaction:params', e);
  }

  incrementExtractedToLogOf('transactions');
  return {transaction, params: decodedParameters};
}