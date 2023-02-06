import { queryTransaction } from '../../../../lib/db/queries/transaction.table';
import { GetTransactionResponse } from './tx.model';
import { decodeInputParts } from '../../../../lib/lookso/utils/decode-input-parts';
import { queryContract } from '../../../../lib/db/queries/contract.table';
import { queryContractName } from '../../../../lib/db/queries/contract-metadata.table';
import { queryImages, queryImagesByType } from '../../../../lib/db/queries/image.table';
import { selectImage } from '../../../../lib/utils/select-image';

/**
 * Retrieve a transaction based on its hash.
 *
 * @param txHash The hash of the transaction to retrieve.
 *
 * @returns A transaction object with decoded function call parts, which includes
 *          contract information such as address, standard, name and image.
 */
const getTransaction = async (txHash: string): Promise<GetTransactionResponse> => {
  // Query for the transaction data based on the hash
  const tx = await queryTransaction(txHash);

  // Initialize the transaction response object with the transaction data
  const txResponse: GetTransactionResponse = { ...tx, decodedFunctionCallParts: [] };

  // Attempt to decode the input parts of the transaction
  try {
    txResponse.decodedFunctionCallParts = await decodeInputParts(tx.input, tx.to ? tx.to : '', []);
  } catch (e) {}

  // Loop through each decoded function call part and retrieve related contract information
  for (let i = 0; i < txResponse.decodedFunctionCallParts.length; i++) {
    try {
      const address = txResponse.decodedFunctionCallParts[i].contract.address;
      const contract = await queryContract(address);
      const name = await queryContractName(address);
      const images =
        contract.interfaceCode === 'LSP0'
          ? await queryImagesByType(address, 'profile')
          : await queryImages(address);
      txResponse.decodedFunctionCallParts[i].contract = {
        address,
        standard: contract.interfaceCode ? contract.interfaceCode : undefined,
        name,
        image: selectImage(images, { minWidthExpected: 210 }).url,
      };
    } catch (e) {}
  }

  // Return the transaction response object
  return txResponse;
};

export const looksoTxService = {
  getTransaction,
};
