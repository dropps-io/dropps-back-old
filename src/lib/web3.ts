import Web3 from 'web3';

import { HTTP_RPC } from '../environment/config';
export const web3: Web3 = new Web3(HTTP_RPC);
