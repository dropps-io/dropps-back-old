import Web3 from 'web3';

import { logError, logMessage } from '../../bin/logger';
import { sleep } from '../blockchain-indexing/utils/sleep';
import { Log } from '../../models/types/log';
import { DB } from '../../bin/db/database';
import { changeIndexingChunkOnLog } from './index-logger';
import { splitToChunks } from './utils/split-in-chunks';
import { extractAndIndexBatch } from './extract-and-index';
import { asyncPromiseAll } from './utils/async-promise-all';
import { getValueFromConfig, setValueOnConfig } from '../../bin/db/config.table';
import { DEBUG_INDEX_SCRIPT } from './config';

const web3 = new Web3('https://rpc.l16.lukso.network');

export async function indexL16() {
  let indexing = 'true';
  do {
    indexing = await getValueFromConfig('indexing');
    const latestIndexedBlock = parseInt(await getValueFromConfig('latest_indexed_block'));
    const blockIteration = parseInt(await getValueFromConfig('block_iteration'));
    const sleepBetweenIteration = parseInt(
      await getValueFromConfig('sleep_between_indexing_iteration'),
    );
    const threadsAmount = DEBUG_INDEX_SCRIPT
      ? 1
      : parseInt(await getValueFromConfig('indexing_threads_amount'));

    try {
      const lastBlock = await web3.eth.getBlockNumber();
      let toBlock =
        lastBlock - latestIndexedBlock > blockIteration
          ? latestIndexedBlock + blockIteration
          : lastBlock;
      if (lastBlock <= latestIndexedBlock) toBlock = latestIndexedBlock;

      const logsRes = await getLogs(latestIndexedBlock, toBlock);
      changeIndexingChunkOnLog(latestIndexedBlock, toBlock, lastBlock, logsRes.length);

      // Split all the logs in n arrays indexed as threads (to make the script faster)
      const promises: Promise<any>[] = [];
      for (const chunk of splitToChunks(logsRes, threadsAmount))
        promises.push(extractAndIndexBatch(chunk, lastBlock));
      await asyncPromiseAll(promises);

      await setValueOnConfig('latest_indexed_block', toBlock.toString());
      await sleep(sleepBetweenIteration);
    } catch (e) {
      logError(e);
      logMessage('GOT ERROR');
      await sleep(sleepBetweenIteration);
    }
  } while (indexing === 'true');
  await DB.end();
}

async function getLogs(fromBlock: number, toBlock: number): Promise<Log[]> {
  return new Promise<Log[]>(async (resolve, reject) => {
    await web3.eth.getPastLogs(
      { fromBlock: fromBlock, toBlock: toBlock },
      async (error, logsRes) => {
        if (logsRes) resolve(logsRes);
        else reject(error);
      },
    );
  });
}
