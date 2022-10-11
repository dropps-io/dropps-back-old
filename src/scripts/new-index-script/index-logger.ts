import * as readline from "readline";
import {DEBUG_INDEX_SCRIPT} from "./config";
import {Log} from "../../models/types/log";

const chunk = {
  fromBlock: 0,
  toBlock: 0,
  logsAmount: 0,
  logsExtracted: 0,
}
let currentBlock: number = 0;
let lastBlock: number = 0;
const errors: { [key: string]: number } = {};
const extractedContracts: { [key: string]: number; } = {};
const extracted: { [key: string]: number; } = {};
let currentLog: Log;

function logToConsole() {
  console.clear();
  console.log('---INDEXING-L16-NETWORK---');
  console.log(`L16 extraction: ${Math.round(currentBlock / lastBlock * 100 * 100) / 100}%`);
  console.log('---------------------------');
  console.log(`Chunk ${chunk.fromBlock}:${chunk.toBlock}`);
  console.log(`Chunk logs: ${chunk.logsAmount}`);
  console.log(`Chunk extraction: ${Math.round(chunk.logsExtracted / chunk.logsAmount * 100 * 100) / 100}%`);
  console.log(`Current block: ${currentBlock}`);
  console.log('-----EXTRACTED-CONTRACTS----');
  console.table(extractedContracts);
  console.log('----------EXTRACTED----------');
  console.table(extracted);
  console.log('----------ERRORS------------');
  console.table(errors);
}

export function changeIndexingChunkOnLog(from: number, to: number, _lastBlock: number, logsAmount: number) {
  chunk.fromBlock = from;
  chunk.toBlock = to;
  chunk.logsExtracted = 0;
  chunk.logsAmount = logsAmount;
  lastBlock = _lastBlock;
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
  if (extractedContracts[code]) extractedContracts[code]++;
  else extractedContracts[code] = 1;
  logToConsole();
}

export function incrementExtractedToLogOf(element: string) {
  if (extracted[element]) extracted[element]++;
  else extracted[element] = 1;
  logToConsole();
}

export async function reportIndexingScriptError(fn: string, e: any, context?: any) {
  if (errors[fn]) errors[fn]++;
  else errors[fn] = 1;
  if (DEBUG_INDEX_SCRIPT) await promptError(fn, e, context);
  logToConsole();
}

async function promptError(fn: string, e: any, context?: any) {
  console.log('--------ERROR--------');
  console.log(`Location: ${fn}`);
  console.log('--------LOG--------');
  console.log(currentLog);
  console.log('--------DETAILS--------');
  console.log(e);
  if (context) {
    console.log('--------CONTEXT--------');
    console.log(context);
  }
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