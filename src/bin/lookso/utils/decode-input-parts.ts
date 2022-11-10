import LSP6KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";

import {web3} from "../../web3/web3";
import {MethodInterface} from "../../../models/types/method-interface";
import {DecodedParameter} from "../../../models/types/decoded-parameter";
import {MethodParameter} from "../../../models/types/method-parameter";
import {AbiItem} from "web3-utils";
import {queryMethodInterface} from "../../db/method-interface.table";
import {queryMethodParameters} from "../../db/method-parameter.table";

const methods: {interface: Omit<MethodInterface, 'hash' | 'type'>, parameters: Omit<MethodParameter, 'methodId' | 'indexed'>[]}[] = [
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
]

export type Contract = {address: string, standard?: string, name?: string, image?: string};
export type DecodedFunctionCall = {contract: Contract, methodInterface: Omit<MethodInterface, 'hash' | 'type'>, decodedParameters: DecodedParameter[]};

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
              return {name: m.name, type: m.type, value: decodedParams[m.name]}
            })
          };
        return results.concat(functionCall);
      }
      catch (e) {
        return results;
      }
  }
}