import { Log } from '../../../models/types/log';
import { web3 } from '../../../bin/web3/web3';
import { decodeSetDataValueFromInput } from '../../blockchain-indexing/utils/set-data-from-input';
import { reportIndexingScriptError } from '../index-logger';
import { extractDataFromKey } from './extract-key-data';
import { IPFS_GATEWAY } from '../../../environment/config';
import { UniversalProfileReader } from '../../../bin/UniversalProfile/UniversalProfileReader.class';
import { indexDataChanged } from '../indexing/index-data-changed';

export async function extractAndIndexDataChangedEvent(
  log: Log,
  decodedParameters: { [key: string]: string },
  lastBlock: number,
) {
  let dataChanged: { key: string; value: string }[] = [];
  const dataKey = decodedParameters['dataKey'];
  try {
    const th = await web3.eth.getTransaction(log.transactionHash);
    dataChanged = decodeSetDataValueFromInput(th.input);
  } catch (e) {
    await reportIndexingScriptError('extractDataChangedEvent', e);
  }

  // We might not find the values of the keys in the transaction (if the data has been change as an internal transaction)
  // In this case, if the transaction is recent enough, we fetch the last value and use it as reference
  if (dataChanged.length === 0) {
    await extractDataFromKey(log, lastBlock, dataKey);
    if (log.blockNumber > lastBlock - 10) {
      try {
        const contract = new UniversalProfileReader(log.address, IPFS_GATEWAY, web3);
        const value: string = (await contract.getDataUnverified([dataKey]))[0];
        await indexDataChanged(log.address, dataKey, value, log.blockNumber);
        await extractDataFromKey(log, lastBlock, dataKey, value);
      } catch (e) {
        await reportIndexingScriptError('extractAndIndexDataChangedEvent:fetchValue', e);
        await extractDataFromKey(log, lastBlock, dataKey);
      }
    }
  } else {
    for (const keyValue of dataChanged) {
      if (keyValue.key === dataKey) {
        await extractDataFromKey(log, lastBlock, keyValue.key, keyValue.value);
        await indexDataChanged(log.address, dataKey, keyValue.value, log.blockNumber);
      }
    }
  }
}
