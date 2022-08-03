import {AbiInput} from "web3-utils";
import {StandardInterface} from "./data-extracting/utils/contract-identification/standard-interfaces";
import {LSP4DigitalAsset, LSP4DigitalAssetMetadata} from "../UniversalProfile/models/lsp4-digital-asset.model";
import {LSP3UniversalProfile} from "../UniversalProfile/models/lsp3-universal-profile.model";
import {ERC725JSONSchema} from "@erc725/erc725.js";
import {EthLogs} from "./EthLogs.class";
import {DecodeDataOutput} from "@erc725/erc725.js/build/main/src/types/decodeData";

export interface Log {
  id?: string;
  address: string;
  data: string;
  topics: string[];
  logIndex: number;
  transactionIndex: number;
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
}

export interface SolParameterWithValue extends AbiInput{
  value: string;
}

export interface SolMethod{
  hash: string
  id: string
  name: string;
  type: 'function' | 'event';
  parameters: AbiInput[];
}

export const UNKNOWN_SOL_EVENT: SolMethod = {name: 'Unknown', type: 'event', hash: '0x', id: '0x', parameters: []};

export interface ExtractedLogData {
  extracted: boolean,
  ContractCreated?: ContractCreatedData;
  Executed?: ExecutedData;
  DataChanged?: DataChangedData;
  OwnershipTransferred?: OwnershipTransferredData;
  ValueReceived?: ValueReceivedData;
}

export interface ValueReceivedData {
  sender: ContractData;
}

export interface OwnershipTransferredData {
  previousOwner: ContractData;
  newOwner: ContractData;
}

export interface DataChangedData {
  key: string;
  schema?: ERC725JSONSchema;
  value?: DecodeDataOutput | string;
  currentValue?: DecodeDataOutput | string;
}

export interface ExecutedData {
  address: string;
  interface?: SolMethod;
  contract: StandardsData & {
    interface?: StandardInterface,
  };
  value: number;
  logs: EthLogs;
}

export interface ContractCreatedData extends ContractData {
  value: number,
}

export interface ContractData extends StandardsData{
  address: string,
  interface?: StandardInterface,
}

export interface StandardsData {
  LSP0?: LSP3UniversalProfile,
  LSP7?: LSP7Data,
  LSP8?: LSP4DigitalAsset
}

export interface LSP7Data {
  name: string,
  symbol: string,
  supply: number,
  isNFT: boolean,
  metadata?: LSP4DigitalAssetMetadata
}