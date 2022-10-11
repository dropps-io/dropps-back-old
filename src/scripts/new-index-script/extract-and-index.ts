import {Log} from "../../models/types/log";
import {queryContract} from "../../bin/db/contract.table";
import {extractContract} from "./extraction/extract-contract";
import {ContractFullMetadata} from "./models/contract-metadata.model";
import {queryTransaction} from "../../bin/db/transaction.table";
import {Transaction} from "../../models/types/transaction";
import {extractTransaction} from "./extraction/extract-transaction";
import {extractLog} from "./extraction/extract-log";
import {extractRegistry} from "./extraction/extract-registry";

export async function extractAndIndex(log: Log, lastBlock: number) {
  let tx: { transaction: Transaction, params: { [key: string]: any }};

  await extractAndIndexContract(log.address);

  try {
    await queryTransaction(log.transactionHash);
  } catch (e) {
    tx = await extractTransaction(log);
  }

  await extractLog(log, lastBlock);

  // If (event related to the registry, do not index it as a post (so it does not appear in the feed)
  // if (!(POST_VALIDATOR_ADDRESS.includes(decodedParameters['to']) || (decodedParameters['dataKey'] && decodedParameters['dataKey'] === KEY_LSPXXSocialRegistry))) {
  //   await indexEvent(log, decodedParameters, eventInterface);
  // }
}

export async function extractAndIndexContract(address: string) {
  let contract: { metadata: ContractFullMetadata | null, interfaceCode: string };
  try {
    await queryContract(address);
  }
  catch (e) {
    contract = await extractContract(address);
  }
  //indexContract
}

export async function extractAndIndexRegistry(log: Log) {
  const posts = await extractRegistry(log);
}