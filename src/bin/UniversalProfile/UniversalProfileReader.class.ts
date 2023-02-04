import { URLDataWithHash } from '@erc725/erc725.js/build/main/src/types/encodeData/JSONURL';
import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import Lsp3UniversalProfileSchema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import axios from 'axios';

import { generatePermissionKey } from './utils/generate-permission-key';
import UniversalProfileArtifact from './abi/UniversalProfile.json';
import {
  initialUniversalProfile,
  LSP3UniversalProfile,
} from './models/lsp3-universal-profile.model';
import { logError } from '../logger';
import { formatUrl } from '../utils/format-url';

interface GetDataDynamicKey {
  keyName: string;
  dynamicKeyParts: string | string[];
}

export interface Permissions {
  CHANGEOWNER: boolean;
  CHANGEPERMISSIONS: boolean;
  ADDPERMISSIONS: boolean;
  SETDATA: boolean;
  CALL: boolean;
  STATICCALL: boolean;
  DELEGATECALL: boolean;
  DEPLOY: boolean;
  TRANSFERVALUE: boolean;
  SIGN: boolean;
}

export interface DecodeDataOutput {
  value: string | string[] | URLDataWithHash;
  name: string;
  key: string;
}

export class UniversalProfileReader {
  protected readonly _address: string;
  protected readonly _erc725: ERC725;
  protected readonly _contract: Contract;

  protected _web3: Web3;
  private _metadata: LSP3UniversalProfile = initialUniversalProfile();

  constructor(address: string, ipfsGateway: string, web3: Web3) {
    this._erc725 = new ERC725(
      Lsp3UniversalProfileSchema as ERC725JSONSchema[],
      address,
      web3.currentProvider,
      { ipfsGateway },
    );
    this._address = address;
    this._web3 = web3;
    this._contract = new this._web3.eth.Contract(
      UniversalProfileArtifact.abi as AbiItem[],
      address,
    );
  }

  get metadata(): LSP3UniversalProfile {
    return this._metadata;
  }

  get address(): string {
    return this._address;
  }

  public async initialize() {
    await this.fetchMetadata();
  }

  public async getData(keys?: (string | GetDataDynamicKey)[]): Promise<DecodeDataOutput[]> {
    return await this._erc725.getData(keys);
  }

  public async getDataUnverified(keys: string[]): Promise<any[]> {
    return await this._contract.methods.getData(keys).call();
  }

  public async fetchData(keys?: (string | GetDataDynamicKey)[]): Promise<DecodeDataOutput[]> {
    return await this._erc725.fetchData(keys);
  }

  public async fetchPermissionsOf(address: string): Promise<Permissions | false> {
    try {
      const permissionsValue: string = (
        await this.getDataUnverified([generatePermissionKey(address)])
      )[0] as string;
      if (permissionsValue === '0x') return false;
      else return ERC725.decodePermissions(permissionsValue);
    } catch (e) {
      logError(e);
      return false;
    }
  }

  private async fetchMetadata() {
    const data = await this._erc725.getData('LSP3Profile');
    const url = formatUrl((data.value as URLDataWithHash).url);
    const lsp3Profile = (await axios.get(url)).data;
    this._metadata = lsp3Profile.LSP3Profile as LSP3UniversalProfile;
  }
}
