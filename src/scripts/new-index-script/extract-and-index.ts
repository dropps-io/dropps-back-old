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
import {POST_VALIDATOR_ADDRESS} from "../../environment/config";
import {KEY_LSPXXSocialRegistry} from "../../bin/utils/constants";
import {indexEvent} from "./indexing/index-event";
import {indexTransaction} from "./indexing/index-transaction";
import {MethodParameter} from "../../models/types/method-parameter";
import {indexContract} from "./indexing/index-contract";


export async function extractAndIndex(log: Log, lastBlock: number) {
  let tx: {transaction: Transaction, params: MethodParameter[], decodedParams: { [key: string]: any }};

  await extractAndIndexContract(log.address);

  try {
    await queryTransaction(log.transactionHash);
  } catch (e) {
    tx = await extractTransaction(log);
    await indexTransaction(tx.transaction, log, tx.params, tx.decodedParams);
  }

  await extractAndIndexLog(log, lastBlock);
}

async function extractAndIndexLog(log: Log, lastBlock: number) {
  let event;
  try {
    await queryEventByTh(log.transactionHash, (log.id as string).slice(4, 12));
  } catch (e) {
    try {
      event = await extractLog(log);

      // If (event related to the registry, do not index it as a post (so it does not appear in the feed)
      if (!(POST_VALIDATOR_ADDRESS.includes(event.params['to']) || (event.params['dataKey'] && event.params['dataKey'] === KEY_LSPXXSocialRegistry))) {
        await indexEvent(log, event.params, event.eventInterface);
      }

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
      await indexEvent(log, {});
      return;
    }
  }
}


export async function extractAndIndexContract(address: string) {
  if (!address) return;
  let contract: { metadata: ContractFullMetadata | null, interfaceCode: string | null };
  try {
    await queryContract(address);
  }
  catch (e) {
    contract = await extractContract(address);
    await indexContract(address, contract.interfaceCode, contract.metadata);
  }
}

export async function extractAndIndexRegistry(log: Log, jsonUrl?: string) {
  const posts = await extractRegistry(log, jsonUrl);
  // TODO Add posts indexing
}