import {Log} from "../../models/types/log";
import {queryContract} from "../../bin/db/contract.table";
import {extractContract} from "./extraction/extract-contract";
import {ContractFullMetadata} from "./models/contract-metadata.model";
import {queryTransaction} from "../../bin/db/transaction.table";
import {Transaction} from "../../models/types/transaction";
import {extractTransaction} from "./extraction/extract-transaction";

export async function extractAndIndex(log: Log) {
  let contract: { metadata: ContractFullMetadata | null, interfaceCode: string };
  let tx: { transaction: Transaction, params: { [key: string]: any }};

  try {
    await queryContract(log.address);
  }
  catch (e) {
    contract = await extractContract(log.address);
  }

  try {
    await queryTransaction(log.transactionHash);
  } catch (e) {
    tx = await extractTransaction(log);
  }
}