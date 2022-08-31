import {tryExecuting} from "../../../bin/utils/try-executing";
import {insertDataChanged} from "../../../bin/db/data-changed.table";
import {INDEX_DATA} from "../config";

export async function indexDataChanged(address: string, key: string, value: string, blockNumber: number) {
  if (!INDEX_DATA) return;
  try {
    await tryExecuting(insertDataChanged(address, key, value, blockNumber));
  } catch (e) {
    console.error(e);
  }
}