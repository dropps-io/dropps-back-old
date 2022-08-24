import {updateContractName, updateContractSymbol} from "../../../../bin/db/contract-metadata.table";
import {INDEX_DATA} from "../../config";
import {tryExecuting} from "../../../../bin/utils/try-executing";

export async function indexUpdateName(address: string, name: string) {
  if (!INDEX_DATA) return;
  await tryExecuting(updateContractName(address, name));
}

export async function indexUpdateSymbol(address: string, symbol: string) {
  if (!INDEX_DATA) return;
  await tryExecuting(updateContractSymbol(address, symbol));
}