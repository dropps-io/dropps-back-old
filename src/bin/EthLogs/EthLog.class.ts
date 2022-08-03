import Web3 from "web3";

import {
  Log,
  ExtractedLogData,
  SolParameterWithValue, SolMethod, UNKNOWN_SOL_EVENT,
} from "./EthLog.models";
import {
  extractContractData,
  extractDataChangedEventData,
  extractExecutedEventData
} from "./data-extracting/extract-log-data";
import {insertEvent, queryEventByTh} from "../db/event.table";
import {insertContract, queryContract} from "../db/contract.table";
import {tryIdentifyingContract} from "./data-extracting/utils/contract-identification/identify-contract";
import {insertDecodedParameter} from "../db/decoded-parameter.table";
import {insertPost} from "../db/post.table";
import keccak256 from "keccak256";
import {insertTransaction, queryTransaction} from "../db/transaction.table";
import {insertDataChanged} from "../db/data-changed.table";
import {ContractMetadata} from "../../models/types/contract-metadata";
import {insertContractMetadata} from "../db/contract-metadata.table";
import {Transaction} from "../../models/types/transaction";
import {methodIdToInterface} from "./data-extracting/utils/method-identification";
import {queryMethodInterfaceWithParameters} from "../db/method-interface.table";
import {EthLogs} from "./EthLogs.class";

export class EthLog {

  private readonly _web3: Web3;
  private readonly _log: Log;
  private readonly _event: SolMethod = UNKNOWN_SOL_EVENT;
  private readonly _decodedParameters;

  private _extractedData: ExtractedLogData = { extracted: false };

  constructor(log: Log, provider: any, method: {method?: SolMethod, hashToSolMethod?: Map<string, SolMethod>}) {
    this._log = log;
    this._web3 = new Web3(provider);
    if (method.method) {
      this._event = method.method;
    } else if (method.hashToSolMethod) {
      this._event = method.hashToSolMethod.get(log.topics[0]) ? method.hashToSolMethod.get(log.topics[0]) as SolMethod : UNKNOWN_SOL_EVENT;
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

  public async indexData(): Promise<void> {
    const logIndexed = !!(await queryEventByTh(this._log.transactionHash, this._log.id as string));

    if (!logIndexed) {
      await this.fetchFromBlockchainAndIndex();
    }
  }

  private async fetchFromBlockchainAndIndex(): Promise<void> {
    try {
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
      await this.indexDataExtracted();

    } catch (e) {
      
    }
  }

  private async indexDataExtracted(): Promise<void> {
    try {
      let transaction: Transaction = await queryTransaction(this._log.transactionHash);
      if (!transaction) {
        transaction = await this._web3.eth.getTransaction(this._log.transactionHash);
        await insertTransaction(this._log.transactionHash, transaction.from, transaction.to as string, transaction.value, transaction.input, transaction.blockNumber as number);
      }

      await this.indexContract(this._log.address);

      const eventId: number = await insertEvent(this._log.address, this._log.transactionHash, (this._log.id as string).slice(4, 12), this._log.blockNumber, this._event.hash, this._event.name);
      await insertPost('0x' + keccak256(JSON.stringify(this._log)).toString('hex'), this._log.address, new Date(((await this._web3.eth.getBlock(this._log.blockNumber)).timestamp as number) * 1000), '', '', null, null, eventId);
      for (let parameter of this.parameters) {
        await insertDecodedParameter(eventId, parameter.value, parameter.name, parameter. type);
      }

      switch (this._event.name) {
        case 'ContractCreated':
          break;
        case 'Executed':
          await this.indexContract(this._decodedParameters['to']);
          const methodInterface: SolMethod | undefined = await queryMethodInterfaceWithParameters(this._decodedParameters['selector']);
          if (methodInterface) {
            const transaction = await this._web3.eth.getTransactionReceipt(this.log.transactionHash);
            for (const log of transaction.logs) {
              // We don't add the Executed events/logs, so we avoid infinite recursive loop
              const logObject = new EthLog(log, this._web3.currentProvider, {method: methodInterface});
              if (!log.topics[0].includes('0x48108744') && !log.topics[0].includes('0x6b934045')) await logObject.indexData();
            }
          }
          break;
        case 'DataChanged':
          const th = await this._web3.eth.getTransaction(this._log.transactionHash);
          const dataChanged = this.decodeSetDataValue(th.input);

          for (let keyValue of dataChanged) {
            await insertDataChanged(this._log.address, keyValue.key, keyValue.value, th.blockNumber as number);
          }
        }
    } catch (e) {
      // console.error(e);
    }
  }

  private async indexContract(address: string) {
    const contractIndexed = !!(await queryContract(address));

    if (!contractIndexed) {
      const standardInterface = await tryIdentifyingContract(this._log.address, this._web3);
      await insertContract(this._log.address, standardInterface?.code as string);

      if (standardInterface?.code) {
        const contractData = await extractContractData(this._log.address, this._web3, standardInterface);
        if (contractData.LSP0) {
          const metadata: ContractMetadata = {
            address: this._log.address,
            name: contractData.LSP0.name,
            description: contractData.LSP0.description,
            symbol: '',
            isNFT: false,
            supply: 0
          }
          await insertContractMetadata(this.log.address, metadata.name, metadata.symbol, metadata.description, metadata.isNFT, metadata.supply);
        }
        if (contractData.LSP7) {
          const metadata: ContractMetadata = {
            address: this._log.address,
            name: contractData.LSP7.name,
            description: contractData.LSP7.metadata?.description ? contractData.LSP7.metadata?.description : '',
            symbol: contractData.LSP7.symbol,
            isNFT: contractData.LSP7.isNFT,
            supply: contractData.LSP7.supply
          }
          await insertContractMetadata(this.log.address, metadata.name, metadata.symbol, metadata.description, metadata.isNFT, metadata.supply);
        }
        if (contractData.LSP8) {
          const metadata: ContractMetadata = {
            address: this._log.address,
            name: contractData.LSP8.name,
            description: contractData.LSP8.metadata?.description ? contractData.LSP8.metadata?.description : '',
            symbol: contractData.LSP8.symbol,
            isNFT: true,
            supply: 0
          }
          await insertContractMetadata(this.log.address, metadata.name, metadata.symbol, metadata.description, metadata.isNFT, metadata.supply);
        }
      }
    }
  }

  private decodeSetDataValue(input: string): {key: string, value: string}[] {
    switch (input.slice(0, 10)) {
      case '0x09c5eabe':
        return this.decodeSetDataValue(this._web3.eth.abi.decodeParameters([{name: 'bytes', type: 'bytes'}], input.slice(10))['bytes'] as string);
      case '0x44c028fe':
        return this.decodeSetDataValue(this._web3.eth.abi.decodeParameters(['uint256', 'address', 'uint256' ,{name: 'bytes', type: 'bytes'}], input.slice(10))['bytes'] as string);
      case '0x7f23690c':
        const decodedDataKeyValue = this._web3.eth.abi.decodeParameters([{name: 'key', type: 'bytes32'}, {name: 'value', type: 'bytes'}], input.slice(10));
        return [{key: decodedDataKeyValue['key'], value: decodedDataKeyValue['value']}];
      case '0x14a6e293':
        const decodedDataKeysValues = this._web3.eth.abi.decodeParameters([{name: 'keys', type: 'bytes32[]'}, {name: 'values', type: 'bytes[]'}], input.slice(10));
        return decodedDataKeysValues['keys'].map((x: string, i: number) => { return {key: x, value: decodedDataKeysValues['values'][i]}});
      default:
        return [];
    }
  }

  private async fetchFromDatabase() {

  }
}


