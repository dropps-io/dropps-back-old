import Web3 from "web3";

import {
  Log,
  ExtractedLogData,
  SolParameterWithValue, SolEvent, UNKNOWN_SOL_EVENT,
} from "./EthLog.models";
import {
  extractContractData,
  extractDataChangedEventData,
  extractExecutedEventData
} from "./data-extracting/extract-log-data";



export class EthLog {

  private readonly _web3: Web3;
  private readonly _log: Log;
  private readonly _event: SolEvent = UNKNOWN_SOL_EVENT;
  private readonly _decodedParameters;

  private _extractedData: ExtractedLogData = { extracted: false };

  constructor(log: Log, provider: any, method: {method?: SolEvent, hashToSolMethod?: Map<string, SolEvent>}) {
    this._log = log;
    this._web3 = new Web3(provider);
    if (method.method) {
      this._event = method.method;
    } else if (method.hashToSolMethod) {
      this._event = method.hashToSolMethod.get(log.topics[0]) ? method.hashToSolMethod.get(log.topics[0]) as SolEvent : UNKNOWN_SOL_EVENT;
    }
    this._decodedParameters = this._event.name === 'unknown' ? {} : this._web3.eth.abi.decodeLog(this._event.parameters, log.data, log.topics.filter((x, i) => i !== 0));
  }

  get name(): string {
    return this._event.name;
  }

  get log(): Log {
    return this._log;
  }

  get parameters(): SolParameterWithValue[] {
    return this._event.parameters.map((x) => {return {...x, value: this._decodedParameters[x.name]}});
  }

  get extractedData(): ExtractedLogData {
    return this._extractedData;
  }

  public async extractData(): Promise<ExtractedLogData> {
    if (this._extractedData.extracted) return this._extractedData;
    switch (this._event.name) {
      case 'ContractCreated':
        this._extractedData.ContractCreated = {...await extractContractData(this.parameters[1].value, this._web3), value: parseInt(this.parameters[2].value)};
        break;
      case 'Executed':
        this._extractedData.Executed = await extractExecutedEventData(this.parameters[1].value, parseInt(this.parameters[2].value), this.parameters[3].value, this.log.transactionHash, this._web3);
        break;
      case 'DataChanged':
        this._extractedData.DataChanged = await extractDataChangedEventData(this.log.address ,this.parameters, this._web3);
        break;
      case 'OwnershipTransferred':
        this._extractedData.OwnershipTransferred = {
          previousOwner: await extractContractData(this.parameters[0].value, this._web3),
          newOwner: await extractContractData(this.parameters[1].value, this._web3)
        }
        break;
      case 'ValueReceived':
        this._extractedData.ValueReceived = {
          sender: await extractContractData(this.parameters[0].value, this._web3),
        }
        break;
    }
    this._extractedData.extracted = true;
    return this._extractedData;
  }
}


