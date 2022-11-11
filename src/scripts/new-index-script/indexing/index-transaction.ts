import {insertTransaction} from "../../../bin/db/transaction.table";
import {insertDecodedFunctionParameter} from "../../../bin/db/decoded-function-parameter.table";
import {MethodParameter} from "../../../models/types/method-parameter";
import {Transaction} from "../../../models/types/transaction";
import {INDEX_DATA} from "../config";
import {reportIndexingScriptError} from "../index-logger";

export async function indexTransaction(transaction: Transaction , parameters: MethodParameter[], decodedParameters: {[p: string]: any}) {
  if (!INDEX_DATA) return;
  try {
    await insertTransaction(transaction.hash, transaction.from, transaction.to as string, transaction.value, transaction.input, transaction.blockNumber as number);
  } catch (e) {
    await reportIndexingScriptError('indexTransaction', e);
  }
  for (let parameter of parameters) {
    try {
      await insertDecodedFunctionParameter(transaction.hash, decodedParameters[parameter.name] as string, parameter.name, parameter.type, parameter.displayType);
    } catch (e) {
      await reportIndexingScriptError('indexTransaction:params', e);
    }
  }
}