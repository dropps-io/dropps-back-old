import {insertContract} from "../../../bin/db/contract.table";
import {INDEX_DATA} from "../config";

export async function indexContract(address: string, code: string | null) {
  if (!INDEX_DATA) return;
  await insertContract(address, code);
}