import {updateContractName, updateContractSymbol} from "../../../../bin/db/contract-metadata.table";
import {INDEX_DATA} from "../../config";

export async function indexUpdateName(address: string, name: string) {
  if (!INDEX_DATA) return;
  await updateContractName(address, name);
}

export async function indexUpdateSymbol(address: string, symbol: string) {
  if (!INDEX_DATA) return;
  await updateContractSymbol(address, symbol);
}