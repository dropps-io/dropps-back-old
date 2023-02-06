import { AbiInput } from 'web3-utils';

export interface SolMethod {
  hash: string;
  id: string;
  name: string;
  type: 'function' | 'event';
  parameters: AbiInput[];
}
