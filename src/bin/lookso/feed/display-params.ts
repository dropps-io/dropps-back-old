import Web3 from 'web3';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';
import LSP4DigitalAssetJSON from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

import { queryContract } from '../../db/contract.table';
import { ContractTable } from '../../../models/types/tables/contract-table';
import {
  insertContractMetadata,
  queryContractName,
  updateContractName,
} from '../../db/contract-metadata.table';
import { FeedDisplayParam } from '../../../models/types/feed-post';
import { web3 } from '../../web3/web3';
import { IPFS_GATEWAY } from '../../../environment/config';
import { queryMethodInterface } from '../../db/method-interface.table';

export async function getDisplayParam(value: string, type: string): Promise<FeedDisplayParam> {
  switch (type) {
    case 'address':
      return { ...(await queryAddressDisplayParam(value)) };
    case 'native':
      return { display: Web3.utils.fromWei(value, 'ether'), value, type, additionalProperties: {} };
    case 'tokenAmount':
      return { display: Web3.utils.fromWei(value, 'ether'), value, type, additionalProperties: {} };
    case 'methodId':
      try {
        const method = await queryMethodInterface(value);
        return { display: method.name, value, type, additionalProperties: {} };
      } catch (e) {
        return { display: 'unknown function', value, type, additionalProperties: {} };
      }
    case 'permissions':
      try {
        const permissions = ERC725.decodePermissions(value);
        let permissionsDisplay = '';
        for (const permissionsKey in permissions) {
          if (permissions[permissionsKey as keyof typeof permissions])
            permissionsDisplay += permissionsDisplay !== '' ? `;${permissionsKey}` : permissionsKey;
        }
        if (permissionsDisplay === '') permissionsDisplay = 'NONE';
        return { value, display: permissionsDisplay, type, additionalProperties: {} };
      } catch (e) {
        return { value, display: '', type, additionalProperties: {} };
      }
    default:
      return { value, display: '', type, additionalProperties: {} };
  }
}

async function queryAddressDisplayParam(address: string): Promise<FeedDisplayParam> {
  let contract: ContractTable, name: string;
  const checkSumAddress = web3.utils.toChecksumAddress(address);
  try {
    contract = await queryContract(checkSumAddress);
  } catch (e) {
    return {
      value: checkSumAddress,
      display: '',
      type: 'address',
      additionalProperties: { interfaceCode: '' },
    };
  }

  if (!contract || !contract.interfaceCode)
    return {
      value: checkSumAddress,
      display: '',
      type: 'address',
      additionalProperties: { interfaceCode: '' },
    };

  try {
    name = await queryContractName(checkSumAddress);

    if (name === '' && (contract.interfaceCode === 'LSP7' || contract.interfaceCode === 'LSP8')) {
      try {
        const erc725Y = new ERC725(
          LSP4DigitalAssetJSON as ERC725JSONSchema[],
          checkSumAddress,
          web3.currentProvider,
          { ipfsGateway: IPFS_GATEWAY },
        );
        const data = await erc725Y.getData('LSP4TokenName');
        if (data && data.value) {
          name = data.value as string;
          tryToUpdateName(checkSumAddress, name);
        }
      } catch (e) {}
    }
  } catch (e) {
    name = '';
  }

  return {
    value: address,
    display: name,
    type: 'address',
    additionalProperties: { interfaceCode: contract.interfaceCode },
  };
}

async function tryToUpdateName(address: string, name: string) {
  try {
    await updateContractName(address, name);
  } catch (e) {
    try {
      await insertContractMetadata(address, name, '', '', false, '');
    } catch (e) {}
  }
}
