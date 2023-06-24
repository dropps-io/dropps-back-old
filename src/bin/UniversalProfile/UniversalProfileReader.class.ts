import { type URLDataWithHash } from '@erc725/erc725.js/build/main/src/types/encodeData/JSONURL';
import { type Subscription } from 'web3-core-subscriptions';
import { ERC725, type ERC725JSONSchema } from '@erc725/erc725.js';
import { type Contract } from 'web3-eth-contract';
import { type AbiItem } from 'web3-utils';
import { type Log } from 'web3-core';
import Lsp3UniversalProfileSchema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import LSP6KeyManager from '@erc725/erc725.js/schemas/LSP6KeyManager.json';

import { generatePermissionKey } from './utils/generate-permission-key';
import UniversalProfileArtifact from './abi/UniversalProfile.json';
import {
	initialUniversalProfile,
	type LSP3UniversalProfile,
} from './models/lsp3-universal-profile.model';

import type Web3 from 'web3';
import {FetchDataOutput} from '@erc725/erc725.js/build/main/src/types/decodeData';

interface GetDataDynamicKey {
	keyName: string;
	dynamicKeyParts: string | string[];
}

export type Permission =
	| 'CHANGEOWNER'
	| 'ADDCONTROLLER'
	| 'CHANGEPERMISSIONS'
	| 'ADDEXTENSIONS'
	| 'CHANGEEXTENSIONS'
	| 'ADDUNIVERSALRECEIVERDELEGATE'
	| 'CHANGEUNIVERSALRECEIVERDELEGATE'
	| 'REENTRANCY'
	| 'SUPER_TRANSFERVALUE'
	| 'TRANSFERVALUE'
	| 'SUPER_CALL'
	| 'CALL'
	| 'SUPER_STATICCALL'
	| 'STATICCALL'
	| 'SUPER_DELEGATECALL'
	| 'DELEGATECALL'
	| 'DEPLOY'
	| 'SUPER_SETDATA'
	| 'SETDATA'
	| 'ENCRYPT'
	| 'DECRYPT'
	| 'SIGN';

export type Permissions = { [day in Permission]: boolean };

export const initialPermissions: Permissions = {
	CHANGEOWNER: false,
	ADDCONTROLLER: false,
	CHANGEPERMISSIONS: false,
	ADDEXTENSIONS: false,
	CHANGEEXTENSIONS: false,
	ADDUNIVERSALRECEIVERDELEGATE: false,
	CHANGEUNIVERSALRECEIVERDELEGATE: false,
	REENTRANCY: false,
	SUPER_TRANSFERVALUE: false,
	TRANSFERVALUE: false,
	SUPER_CALL: false,
	CALL: false,
	SUPER_STATICCALL: false,
	STATICCALL: false,
	SUPER_DELEGATECALL: false,
	DELEGATECALL: false,
	DEPLOY: false,
	SUPER_SETDATA: false,
	SETDATA: false,
	ENCRYPT: false,
	DECRYPT: false,
	SIGN: false,
};

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
	private readonly _metadata: LSP3UniversalProfile = initialUniversalProfile();
	private readonly _logsSubscription: Subscription<Log>;

	constructor(address: string, ipfsGateway: string, web3: Web3) {
		this._erc725 = new ERC725(
			(Lsp3UniversalProfileSchema as ERC725JSONSchema[]).concat(
				LSP6KeyManager as ERC725JSONSchema[]
			),
			address,
			web3.currentProvider,
			{ ipfsGateway }
		);
		this._address = address;
		this._web3 = web3;
		this._contract = new this._web3.eth.Contract(
			UniversalProfileArtifact.abi as AbiItem[],
			address
		);
		this._logsSubscription = web3.eth.subscribe('logs', {
			fromBlock: 0,
			address: this._address,
		});
	}

	get metadata(): LSP3UniversalProfile {
		return this._metadata;
	}

	get address(): string {
		return this._address;
	}

	public async getData(keys?: Array<string | GetDataDynamicKey>): Promise<DecodeDataOutput[]> {
		return await this._erc725.getData(keys);
	}

	public async getDataUnverified(keys: string[]): Promise<any[]> {
		return await this._contract.methods.getData(keys).call();
	}

	public async fetchData(keys?: Array<string | GetDataDynamicKey>): Promise<FetchDataOutput[]> {
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
			return false;
		}
	}

	public async fetchAddressPermissions(): Promise<string[]> {
		return (await this._erc725.getData('AddressPermissions[]')).value as string[];
	}
}
