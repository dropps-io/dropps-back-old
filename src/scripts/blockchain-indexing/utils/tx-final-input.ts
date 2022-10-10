import {web3} from "../../../bin/web3/web3";

export function decodeTransactionFinalInput(input: string): string {
  if (!input) return '';
  switch (input.slice(0, 10)) {
    case '0x09c5eabe':
      return decodeTransactionFinalInput(web3.eth.abi.decodeParameters([{name: 'bytes', type: 'bytes'}], input.slice(10))['bytes'] as string);
    case '0x44c028fe':
      return decodeTransactionFinalInput(web3.eth.abi.decodeParameters(['uint256', 'address', 'uint256' ,{name: 'bytes', type: 'bytes'}], input.slice(10))['bytes'] as string);
    case '0x902d5fa0':
      return decodeTransactionFinalInput(web3.eth.abi.decodeParameters(['bytes', 'uint256',{name: 'bytes', type: 'bytes'}], input.slice(10))['bytes'] as string);
    default:
      return input;
  }
}