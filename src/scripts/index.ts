import {indexBlockchain} from "./index-blockchain";
import {clearDB} from "../test/helpers/database-helper";
import {insertContractInterface} from "../bin/db/contract-interface.table";
import {generateAndPersistMethodInterfaces} from "./generate-method-interfaces";
import LSP7Mintable from "@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json";
import LSP8Mintable from "@lukso/lsp-smart-contracts/artifacts/LSP8Mintable.json";
import LSP0ERC725Account from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";
import LSP6KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import LSP9Vault from "@lukso/lsp-smart-contracts/artifacts/LSP9Vault.json";
import LSP1DelegateUP from "@lukso/lsp-smart-contracts/artifacts/LSP1UniversalReceiverDelegateUP.json";
import LSP1DelegateVault from "@lukso/lsp-smart-contracts/artifacts/LSP1UniversalReceiverDelegateVault.json";
import ERC1155 from "../assets/artifacts/ERC1155PresetMinterPauser.json";
import ERC20 from "../assets/artifacts/ERC20PresetMinterPauser.json";
import ERC777 from "../assets/artifacts/ERC777PresetFixedSupply.json";
import ERC721 from "../assets/artifacts/ERC721PresetMinterPauserAutoId.json";
import {AbiItem} from "web3-utils";
import {generateJWT} from "../bin/json-web-token";
import {queryContractName} from "../bin/db/contract-metadata.table";
import {queryContract} from "../bin/db/contract.table";
import {executeQuery} from "../bin/db/database";
import {insertFollow} from "../bin/db/follow.table";

const standardInterfaces = [
    {id: '0x9a3bfe88', code: 'LSP0', name: 'Universal Profile'},
    {id: '0xc403d48f', code: 'LSP6', name: 'Key Manager'},
    {id: '0xe33f65c3', code: 'LSP7', name: 'Digital Asset'},
    {id: '0x49399145', code: 'LSP8', name: 'Identifiable Digital Asset'}
];

async function main() {
    await clearDB();

    for (let standardInterface of standardInterfaces) {
        await insertContractInterface(standardInterface.code, standardInterface.id, standardInterface.name);
    }

    await generateAndPersistMethodInterfaces(
        [
            LSP0ERC725Account.abi as AbiItem[],
            LSP8Mintable.abi as AbiItem[],
            LSP7Mintable.abi as AbiItem[],
            LSP6KeyManager.abi as AbiItem [],
            LSP1DelegateVault.abi as AbiItem [],
            LSP1DelegateUP.abi as AbiItem [],
            LSP9Vault.abi as AbiItem [],
            ERC1155.abi as AbiItem[],
            ERC777.abi as AbiItem[],
            ERC721.abi as AbiItem[],
            ERC20.abi as AbiItem[],
        ]);

    await indexBlockchain(60000);

    // console.log(generateJWT('0x742242E9572cEa7d3094352472d8463B0a488b80'));

    // const res = await executeQuery('SELECT * FROM "contract" WHERE "interfaceCode" = $1', ['LSP0']);
    // for (let profile of res.rows) {
    //     await insertFollow(profile.address, '0x742242E9572cEa7d3094352472d8463B0a488b80');
    // }
}

main();