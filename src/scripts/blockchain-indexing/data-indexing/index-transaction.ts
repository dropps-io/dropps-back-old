import {tryExecuting} from "../../../bin/utils/try-executing";
import {insertTransaction} from "../../../bin/db/transaction.table";
import {insertDecodedFunctionParameter} from "../../../bin/db/decoded-function-parameter.table";
import {Log} from "../../../models/types/log";
import {MethodParameter} from "../../../models/types/method-parameter";
import {Transaction} from "../../../models/types/transaction";
import {INDEX_DATA} from "../config";
import {logError} from "../../../bin/logger";

export async function indexTransaction(transaction: Transaction ,log: Log, parameters: MethodParameter[], decodedParameters: {[p: string]: any}) {
  if (!INDEX_DATA) return;
  try {
    await tryExecuting(insertTransaction(log.transactionHash, transaction.from, transaction.to as string, transaction.value, transaction.input, transaction.blockNumber as number));
    for (let parameter of parameters) {
      await tryExecuting(insertDecodedFunctionParameter(log.transactionHash, decodedParameters[parameter.name] as string, parameter.name, parameter.type, parameter.displayType));
    }
  } catch (e) {
    logError(e);
  }
}