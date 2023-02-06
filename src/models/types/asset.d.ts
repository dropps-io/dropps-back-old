import { SOL_STANDARD } from '../enums/sol-standard';
import { Token } from './token';
import { TOKEN_ID_TYPE } from '../enums/token-id-type';

export interface Asset {
  address: string;
  name: string;
  image: string;
  type: SOL_STANDARD;
  tokenIdType?: TOKEN_ID_TYPE;
  tokens?: Token[];
}

export interface AssetWithBalance extends Asset {
  balance?: string;
}
