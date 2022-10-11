import Web3 from "web3";
import {logError, logMessage} from "../../bin/logger";
import {sleep} from "../blockchain-indexing/utils/sleep";
import {Log} from "../../models/types/log";
import {DB, executeQuery} from "../../bin/db/database";
import {changeIndexingChunkOnLog, setLogExtractingToLog} from "./index-logger";
import {extractAndIndex} from "./extract-and-index";

const web3 = new Web3('https://rpc.l16.lukso.network');

export async function indexL16() {
  let indexing = 'true';
  do {
    indexing = await getValueFromConfig('indexing');
    const latestIndexedBlock = parseInt(await getValueFromConfig('latest_indexed_block'));
    const blockIteration = parseInt(await getValueFromConfig('block_iteration'));
    const sleepBetweenIteration = parseInt(await getValueFromConfig('sleep_between_indexing_iteration'));

    try {
      const lastBlock = await web3.eth.getBlockNumber();
      const toBlock = lastBlock - latestIndexedBlock > blockIteration ? latestIndexedBlock + blockIteration : lastBlock;


      const logsRes = await getLogs(latestIndexedBlock, toBlock);
      changeIndexingChunkOnLog(latestIndexedBlock, toBlock, lastBlock, logsRes.length);
      for (let log of logsRes) {
        setLogExtractingToLog(log);
        await extractAndIndex(log, lastBlock);
      }

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
  return new Promise<Log[]> (async (resolve, reject) => {
    await web3.eth.getPastLogs({fromBlock: fromBlock, toBlock: toBlock
    }, async (error, logsRes) => {
      if (logsRes) resolve(logsRes);
      else reject(error);
    });
  })
}

export async function getValueFromConfig(key: string): Promise<string> {
  const res = await executeQuery('SELECT (value) FROM "config" WHERE key=$1', [key]);
  if (res.rows.length > 0) return res.rows[0].value;
  else throw 'No value found for this key';
}

export async function setValueOnConfig(key: string, value: string): Promise<void> {
  await executeQuery('UPDATE config SET value=$2 WHERE key=$1', [key, value]);
}