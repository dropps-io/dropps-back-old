import {Log} from "../../../models/types/log";
import {SolMethod} from "../../../models/types/sol-method";
import {queryMethodInterfaceWithParameters} from "../../../bin/db/method-interface.table";
import {web3} from "../../../bin/web3/web3";
import {decodeSetDataValueFromInput} from "../../blockchain-indexing/utils/set-data-from-input";
import {extractAndIndexContract} from "../extract-and-index";
import {incrementExtractedToLogOf, reportIndexingScriptError} from "../index-logger";
import {extractDataFromKey} from "./extract-key-data";

export async function extractLog(log: Log, lastBlock: number) {
  let eventInterface: SolMethod | undefined;
  let decodedParameters: {[key: string]: string} = {};
  try {
    eventInterface = await queryMethodInterfaceWithParameters(log.topics[0].slice(0, 10));
    incrementExtractedToLogOf('knownEvent');
  } catch (e) {
    incrementExtractedToLogOf('unknownEvent');
    return;
  }

  try {
    if (eventInterface && eventInterface.parameters) decodedParameters = !eventInterface.name ? {} : web3.eth.abi.decodeLog(eventInterface.parameters, log.data, log.topics.filter((x, i) => i !== 0));
  } catch (e) {
    await reportIndexingScriptError('extractLog:params', e);
    return;
  }

  switch (eventInterface.name) {
    case 'ContractCreated':
      await extractAndIndexContract(decodedParameters['contractAddress']);
      break;
    case 'Executed':
      await extractAndIndexContract(decodedParameters['to']);
      break;
    case 'OwnershipTransferred':
      await extractAndIndexContract(decodedParameters['previousOwner']);
      await extractAndIndexContract(decodedParameters['newOwner']);
      break;
    case 'UniversalReceiver':
      await extractAndIndexContract(decodedParameters['from']);
      break;
    case 'DataChanged':
      await extractDataChangedEvent(log, decodedParameters, lastBlock);
      break;
  }
}

async function extractDataChangedEvent(log: Log, decodedParameters: { [key: string]: string }, lastBlock: number) {
  let dataChanged: { key: string, value: string }[] = [];
  try {
    const th = await web3.eth.getTransaction(log.transactionHash);
    dataChanged = decodeSetDataValueFromInput(th.input);
  } catch (e) {
    await reportIndexingScriptError('extractDataChangedEvent', e);
  }

  if (dataChanged.length === 0) await extractDataFromKey(log, lastBlock, decodedParameters['dataKey']);
  // If block == last then indexDataChanged with the last value

  for (let keyValue of dataChanged) {
    if (keyValue.key === decodedParameters['dataKey']) {
      await extractDataFromKey(log, lastBlock, keyValue.key, keyValue.value);
      incrementExtractedToLogOf('dataChanged');
      // await indexDataChanged(log.address, keyValue.key, keyValue.value, th.blockNumber as number);
    }
  }
}