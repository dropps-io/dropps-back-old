import { Transaction } from '../../../../models/types/transaction';
import { DecodedFunctionCall } from '../../../../lib/lookso/utils/decode-input-parts';

export interface GetTransactionResponse extends Transaction {
  decodedFunctionCallParts: DecodedFunctionCall[];
}
