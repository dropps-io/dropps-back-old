import LSP7Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json';
import LSP8Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP8Mintable.json';
import LSP0ERC725Account from '@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json';
import LSP6KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json';
import LSP9Vault from '@lukso/lsp-smart-contracts/artifacts/LSP9Vault.json';
import LSP1DelegateUP from '@lukso/lsp-smart-contracts/artifacts/LSP1UniversalReceiverDelegateUP.json';
import LSP1DelegateVault from '@lukso/lsp-smart-contracts/artifacts/LSP1UniversalReceiverDelegateVault.json';
import { AbiItem } from 'web3-utils';
import JSONSCHEMALSP1 from '@erc725/erc725.js/schemas/LSP1UniversalReceiverDelegate.json';
import JSONSCHEMALSP3 from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import JSONSCHEMALSP4 from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import JSONSCHEMALSP5 from '@erc725/erc725.js/schemas/LSP5ReceivedAssets.json';
import JSONSCHEMALSP6 from '@erc725/erc725.js/schemas/LSP6KeyManager.json';
import JSONSCHEMALSP9 from '@erc725/erc725.js/schemas/LSP9Vault.json';
import JSONSCHEMALSP10 from '@erc725/erc725.js/schemas/LSP10ReceivedVaults.json';
import JSONSCHEMALSP12 from '@erc725/erc725.js/schemas/LSP12IssuedAssets.json';
import { ERC725JSONSchema } from '@erc725/erc725.js';

import { insertInDbJsonSchemas } from './insert-in-db-json-schemas';
import { generateAndPersistMethodInterfaces } from './generate-method-interfaces';
import { insertContractInterface } from '../../lib/db/queries/contract-interface.table';
import ERC721 from '../../assets/artifacts/ERC721PresetMinterPauserAutoId.json';
import ERC777 from '../../assets/artifacts/ERC777PresetFixedSupply.json';
import ERC20 from '../../assets/artifacts/ERC20PresetMinterPauser.json';
import ERC1155 from '../../assets/artifacts/ERC1155PresetMinterPauser.json';
import { tryExecuting } from '../../lib/utils/try-executing';

const standardInterfaces = [
  { id: '0x9a3bfe88', code: 'LSP0', name: 'Universal Profile' },
  { id: '0xeb6be62e', code: 'LSP0', name: 'Universal Profile' },
  { id: '0xc403d48f', code: 'LSP6', name: 'Key Manager' },
  { id: '0xe33f65c3', code: 'LSP7', name: 'Digital Asset' },
  { id: '0x5fcaac27', code: 'LSP7', name: 'Digital Asset' },
  { id: '0x49399145', code: 'LSP8', name: 'Identifiable Digital Asset' },
];

export async function fillDb() {
  for (const standardInterface of standardInterfaces) {
    await tryExecuting(
      insertContractInterface(standardInterface.code, standardInterface.id, standardInterface.name),
    );
  }

  await insertInDbJsonSchemas([
    JSONSCHEMALSP1 as ERC725JSONSchema[],
    JSONSCHEMALSP3 as ERC725JSONSchema[],
    JSONSCHEMALSP4 as ERC725JSONSchema[],
    JSONSCHEMALSP5 as ERC725JSONSchema[],
    JSONSCHEMALSP6 as ERC725JSONSchema[],
    JSONSCHEMALSP9 as ERC725JSONSchema[],
    JSONSCHEMALSP10 as ERC725JSONSchema[],
    JSONSCHEMALSP12 as ERC725JSONSchema[],
  ]);

  await generateAndPersistMethodInterfaces([
    LSP0ERC725Account.abi as AbiItem[],
    LSP8Mintable.abi as AbiItem[],
    LSP7Mintable.abi as AbiItem[],
    LSP6KeyManager.abi as AbiItem[],
    LSP1DelegateVault.abi as AbiItem[],
    LSP1DelegateUP.abi as AbiItem[],
    LSP9Vault.abi as AbiItem[],
    ERC1155.abi as AbiItem[],
    ERC777.abi as AbiItem[],
    ERC721.abi as AbiItem[],
    ERC20.abi as AbiItem[],
  ]);
}
