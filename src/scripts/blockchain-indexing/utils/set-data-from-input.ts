import { web3 } from '../../../lib/web3';

export function decodeSetDataValueFromInput(input: string): { key: string; value: string }[] {
  switch (input.slice(0, 10)) {
    case '0x09c5eabe':
      return decodeSetDataValueFromInput(
        web3.eth.abi.decodeParameters([{ name: 'bytes', type: 'bytes' }], input.slice(10))[
          'bytes'
        ] as string,
      );
    case '0x44c028fe':
      return decodeSetDataValueFromInput(
        web3.eth.abi.decodeParameters(
          ['uint256', 'address', 'uint256', { name: 'bytes', type: 'bytes' }],
          input.slice(10),
        )['bytes'] as string,
      );
    case '0x902d5fa0':
      return decodeSetDataValueFromInput(
        web3.eth.abi.decodeParameters(
          ['bytes', 'uint256', { name: 'bytes', type: 'bytes' }],
          input.slice(10),
        )['bytes'] as string,
      );
    case '0x7f23690c':
      const decodedDataKeyValue = web3.eth.abi.decodeParameters(
        [
          { name: 'key', type: 'bytes32' },
          { name: 'value', type: 'bytes' },
        ],
        input.slice(10),
      );
      return [{ key: decodedDataKeyValue['key'], value: decodedDataKeyValue['value'] }];
    case '0x14a6e293':
      const decodedDataKeysValues = web3.eth.abi.decodeParameters(
        [
          { name: 'keys', type: 'bytes32[]' },
          { name: 'values', type: 'bytes[]' },
        ],
        input.slice(10),
      );
      return decodedDataKeysValues['keys'].map((x: string, i: number) => {
        return { key: x, value: decodedDataKeysValues['values'][i] };
      });
    default:
      return [];
  }
}
