import {ERC725JSONSchema} from '@erc725/erc725.js';

export interface Erc725ySchema extends ERC725JSONSchema{
  valueDisplay?: string;
}