import * as readline from "readline";
import {DEBUG_INDEX_SCRIPT} from "./config";
import {Log} from "../../models/types/log";

interface StringMap { [key: string]: number; }

interface Extracted {
  contracts: StringMap
}

const chunk = {
  fromBlock: 0,
  toBlock: 0,
  logsAmount: 0,
  logsExtracted: 0,
}
let currentBlock: number = 0;
const errors = {
  extractLSP3Data: 0,
  extractLSP7Data: 0,
  extractLSP4Data: 0,
  extractContract: 0
};
const extracted: Extracted = {
  contracts: {},
};
let currentLog: Log;

function logToConsole() {
  console.clear();
  console.log('---INDEXING-L16-NETWORK---');
  console.log('---------------------------');
  console.log(`Chunk ${chunk.fromBlock}:${chunk.toBlock}`);
  console.log(`Chunk logs: ${chunk.logsAmount}`);
  console.log(`Chunk extraction: ${Math.round(chunk.logsExtracted / chunk.logsAmount * 100 * 100) / 100}%`);
  console.log(`Current block: ${currentBlock}`);
  console.log('----------EXTRACTED----------');
  console.table(extracted.contracts);
  console.log('----------ERRORS------------');
  console.table(errors);
}

export function changeIndexingChunkOnLog(from: number, to: number, logsAmount: number) {
  chunk.fromBlock = from;
  chunk.toBlock = to;
  chunk.logsExtracted = 0;
  chunk.logsAmount = logsAmount;
  logToConsole();
}

export function setLogExtractingToLog(log: Log) {
  if (currentLog) {
    currentBlock = currentLog.blockNumber;
    chunk.logsExtracted++;
  }
  currentLog = log;
  logToConsole();
}

export function incrementContractExtractedInLog(code: string) {
  if (extracted.contracts[code]) extracted.contracts[code]++;
  else extracted.contracts[code] = 1;
  logToConsole();
}

export async function reportIndexingScriptError(fn: 'extractLSP3Data' | 'extractLSP7Data' | 'extractLSP4Data' | 'extractContract', e: any) {
  errors[fn]++;
  if (DEBUG_INDEX_SCRIPT) await promptError(fn, e);
  logToConsole();
}

async function promptError(fn: string, e: any) {
  console.log('--------ERROR--------');
  console.log(`Location: ${fn}`);
  console.log('--------LOG--------');
  console.log(currentLog);
  console.log('--------DETAILS--------');
  console.log(e);
  await pause();
}

async function pause(): Promise<void> {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Continue? (any) ", function () {
      rl.close();
      resolve();
    });
  })
}