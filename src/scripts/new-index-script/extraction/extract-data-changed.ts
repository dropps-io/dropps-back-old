import {Log} from "../../../models/types/log";
import {web3} from "../../../bin/web3/web3";
import {decodeSetDataValueFromInput} from "../../blockchain-indexing/utils/set-data-from-input";
import {incrementExtractedToLogOf, reportIndexingScriptError} from "../index-logger";
import {extractDataFromKey} from "./extract-key-data";

export async function extractAndIndexDataChangedEvent(log: Log, decodedParameters: { [key: string]: string }, lastBlock: number) {
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