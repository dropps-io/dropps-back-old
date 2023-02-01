import LSP6KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json';

import {web3} from '../../web3/web3';
import {MethodInterfaceTable} from '../../../models/types/tables/method-interface-table';
import {DecodedParameter} from '../../../models/types/decoded-parameter';
import {MethodParameterTable} from '../../../models/types/tables/method-parameter-table';
import {AbiItem} from 'web3-utils';
import {queryMethodInterface} from '../../db/method-interface.table';
import {queryMethodParameters} from '../../db/method-parameter.table';

const methods: {interface: Omit<MethodInterfaceTable, 'hash' | 'type'>, parameters: Omit<MethodParameterTable, 'methodId' | 'indexed'>[]}[] = [
	{
		interface: {id: '0x09c5eabe', name: 'execute'},
		parameters: [{name: 'payload', type: 'bytes'}]
	},
	{
		interface: {id: '0x44c028fe', name: 'execute'},
		parameters: [
			{name: 'operation', type: 'uint256'},
			{name: 'to', type: 'address'},
			{name: 'value', type: 'uint256'},
			{name: 'data', type: 'bytes'},
		]
	},
	{
		interface: {id: '0x902d5fa0', name: 'executeRelayCall'},
		parameters: [
			{name: 'signature', type: 'bytes'},
			{name: 'nonce', type: 'uint256'},
			{name: 'payload', type: 'bytes'},
		]
	}
];

export type Contract = {address: string, standard?: string, name?: string, image?: string};
export type DecodedFunctionCall = {contract: Contract, methodInterface: Omit<MethodInterfaceTable, 'hash' | 'type'>, decodedParameters: DecodedParameter[]};

/**
 * Function used to extract all inputs from a transaction on Lukso, as Lukso use account abstraction
 * This function run recursively until it reached the final function call
 * Ex: executeRelayer -> execute -> mint
 *
 * @param input raw input from a transaction
 * @param address address of the destination contract of the transaction; value "to" from the transaction receipt
 * @param results value used for recursivity, an array of the DecodedFunctionCall already found
 *
 * @return: all decoded function call in execution order (ie. executeRelayer -> execute -> mint)
 */
export async function decodeInputParts(input: string, address: string, results: DecodedFunctionCall[]): Promise<DecodedFunctionCall[]> {
	if (!input) return [];
	let decodedParams: { [x: string]: any; };
	let functionCall: DecodedFunctionCall;
	let upContractAddress: string;

	switch (input.slice(0, 10)) {
	case methods[0].interface.id: // execute method on LSP6 Key Manager
		decodedParams = web3.eth.abi.decodeParameters(methods[0].parameters, input.slice(10));
		functionCall =
        {
        	contract: {address},
        	methodInterface: methods[0].interface,
        	decodedParameters: [{name: 'payload', type: 'bytes', value: decodedParams['payload']}]
        };
		upContractAddress = await (new web3.eth.Contract(LSP6KeyManager.abi as AbiItem[], address)).methods.target.call();
		return await decodeInputParts(decodedParams['payload'] as string, upContractAddress, results.concat(functionCall));

	case methods[1].interface.id: // execute method on ERC725X contract
		decodedParams = web3.eth.abi.decodeParameters(methods[1].parameters, input.slice(10));
		functionCall =
        {
        	contract: {address},
        	methodInterface: methods[1].interface,
        	decodedParameters: [
        		{name: 'operation', type: 'uint256', value: decodedParams['operation']},
        		{name: 'to', type: 'address', value: decodedParams['to']},
        		{name: 'value', type: 'uint256', value: decodedParams['value']},
        		{name: 'data', type: 'bytes', value: decodedParams['data']},
        	]
        };
		return await decodeInputParts(decodedParams['data'] as string, web3.utils.toChecksumAddress(decodedParams['to']), results.concat(functionCall));

	case methods[2].interface.id: // execute method on ERC725X contract
		decodedParams = web3.eth.abi.decodeParameters(methods[2].parameters, input.slice(10));
		functionCall =
        {
        	contract: {address},
        	methodInterface: methods[2].interface,
        	decodedParameters: [
        		{name: 'signature', type: 'bytes', value: decodedParams['signature']},
        		{name: 'nonce', type: 'uint256', value: decodedParams['nonce']},
        		{name: 'payload', type: 'bytes', value: decodedParams['payload']},
        	]
        };
		upContractAddress = await (new web3.eth.Contract(LSP6KeyManager.abi as AbiItem[], address)).methods.target().call();
		return await decodeInputParts(decodedParams['payload'] as string, upContractAddress, results.concat(functionCall));

	default:
		try {
			const methodInterface = await queryMethodInterface(input.slice(0, 10));
			const methodParameters = await queryMethodParameters(input.slice(0, 10));
			decodedParams = web3.eth.abi.decodeParameters(methodParameters, input.slice(10));
			functionCall =
          {
          	contract: {address},
          	methodInterface: methodInterface,
          	decodedParameters: methodParameters.map(m => {
          		return {name: m.name, type: m.type, value: decodedParams[m.name] !== null ? decodedParams[m.name].toString() : 'null'};
          	})
          };
		}
		catch (e) {
			functionCall =
          {
          	contract: {address},
          	methodInterface: {name: 'Unknown Function', id: '0x'},
          	decodedParameters: []
          };
		}
		return results.concat(functionCall);
	}
}