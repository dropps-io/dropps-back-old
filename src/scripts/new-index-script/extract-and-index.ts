import {Log} from "../../models/types/log";
import {queryContract} from "../../bin/db/contract.table";
import {extractContract} from "./extraction/extract-contract";
import {ContractFullMetadata} from "./models/contract-metadata.model";
import {queryTransaction} from "../../bin/db/transaction.table";
import {Transaction} from "../../models/types/transaction";
import {extractTransaction} from "./extraction/extract-transaction";
import {extractLog} from "./extraction/extract-log";
import {extractRegistry} from "./extraction/extract-registry";
import {queryEventByTh} from "../../bin/db/event.table";
import {extractAndIndexDataChangedEvent} from "./extraction/extract-data-changed";


export async function extractAndIndex(log: Log, lastBlock: number) {
  let tx: { transaction: Transaction, params: { [key: string]: any }};

  await extractAndIndexContract(log.address);

  try {
    await queryTransaction(log.transactionHash);
  } catch (e) {
    tx = await extractTransaction(log);
  }

  await extractAndIndexLog(log, lastBlock);

  // If (event related to the registry, do not index it as a post (so it does not appear in the feed)
  // if (!(POST_VALIDATOR_ADDRESS.includes(decodedParameters['to']) || (decodedParameters['dataKey'] && decodedParameters['dataKey'] === KEY_LSPXXSocialRegistry))) {
  //   await indexEvent(log, decodedParameters, eventInterface);
  // }
}

async function extractAndIndexLog(log: Log, lastBlock: number) {
  let event;
  try {
    if (log.id) await queryEventByTh(log.transactionHash, log.id);
  } catch (e) {
    try {
      event = await extractLog(log);

      switch (event.eventInterface.name) {
        case 'ContractCreated':
          await extractAndIndexContract(event.params['contractAddress']);
          break;
        case 'Executed':
          await extractAndIndexContract(event.params['to']);
          break;
        case 'OwnershipTransferred':
          await extractAndIndexContract(event.params['previousOwner']);
          await extractAndIndexContract(event.params['newOwner']);
          break;
        case 'UniversalReceiver':
          await extractAndIndexContract(event.params['from']);
          break;
        case 'DataChanged':
          await extractAndIndexDataChangedEvent(log, event.params, lastBlock);
          break;
      }
    } catch (e) {
      return;
    }
  }
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