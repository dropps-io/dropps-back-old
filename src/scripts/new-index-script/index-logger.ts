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

export function setLogExtractedToLog(block: number) {
  currentBlock = block;
  chunk.logsExtracted++;
  logToConsole();
}

export function incrementContractExtractedInLog(code: string) {
  if (extracted.contracts[code]) extracted.contracts[code]++;
  else extracted.contracts[code] = 1;
  logToConsole();
}

export function reportIndexingScriptError(fn: 'extractLSP3Data' | 'extractLSP7Data' | 'extractLSP4Data' | 'extractContract') {
  errors[fn]++;
  logToConsole();
}