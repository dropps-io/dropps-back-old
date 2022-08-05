import Web3 from "web3";
import {insertEvent, queryEventByTh} from "../bin/db/event.table";
import {insertContract, queryContract} from "../bin/db/contract.table";
import {Contract} from "../models/types/contract";
import {queryContractInterfaces} from "../bin/db/contract-interface.table";
import {ContractInterface} from "../models/types/contract-interface";
import LSP0ERC725Account from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";
import LSP8IdentifiableDigitalAsset from "@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json";
import LSP7DigitalAsset from "@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json";
import LSP4DigitalAssetJSON from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import LSP3UniversalProfileMetadataJSON from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import {AbiItem} from "web3-utils";
import {initialDigitalAssetMetadata, LSP4DigitalAsset, LSP4DigitalAssetMetadata} from "../bin/UniversalProfile/models/lsp4-digital-asset.model";
import ERC725, {ERC725JSONSchema} from "@erc725/erc725.js";
import {formatUrl} from "../bin/utils/format-url";
import {URLDataWithHash} from "@erc725/erc725.js/build/main/src/types/encodeData/JSONURL";
import axios from "axios";
import {insertContractMetadata, updateContractDescription, updateContractName, updateContractSymbol} from "../bin/db/contract-metadata.table";
import {deleteAsset, insertAsset, queryAssets} from "../bin/db/asset.table";
import {deleteImage, insertImage, queryImages} from "../bin/db/image.table";
import {deleteLink, insertLink, queryLinks} from "../bin/db/link.table";
import {initialUniversalProfile, LSP3UniversalProfile} from "../bin/UniversalProfile/models/lsp3-universal-profile.model";
import {deleteTag, insertTag, queryTags} from "../bin/db/tag.table";
import {Transaction} from "../models/types/transaction";
import {insertTransaction, queryTransaction} from "../bin/db/transaction.table";
import {insertPost} from "../bin/db/post.table";
import keccak256 from "keccak256";
import {insertDecodedEventParameter} from "../bin/db/decoded-event-parameter.table";
import {queryMethodInterfaceWithParameters} from "../bin/db/method-interface.table";
import {insertDataChanged} from "../bin/db/data-changed.table";
import {Image} from "../models/types/image";
import {Asset} from "../models/types/asset";
import {Link} from "../models/types/link";
import {LUKSO_IPFS_GATEWAY} from "../bin/utils/lukso-ipfs-gateway";
import {Log} from "../models/types/log";
import {SolMethod} from "../models/types/sol-method";
import {queryMethodParameters} from "../bin/db/method-parameter.table";
import {MethodParameter} from "../models/types/method-parameter";
import {insertDecodedFunctionParameter} from "../bin/db/decoded-function-parameter.table";

const web3 = new Web3('https://rpc.l16.lukso.network');

async function sleep(ms: number) {
    return new Promise<void>((resolve) => {
       setTimeout(() => {
           resolve();
       }, ms);
    });
}

export async function indexBlockchain(latestBlockIndexed: number) {
    let lastBlock: number = 0;
    try {
        lastBlock = await web3.eth.getBlockNumber();
        if (lastBlock - latestBlockIndexed > 5000) lastBlock = latestBlockIndexed + 5000;

        console.log('Indexing from block ' + latestBlockIndexed + ' to block ' + lastBlock);

        const topicsWanted = [
            '0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2',
            '0x8187df79ab47ad16102e7bc8760349a115b3ba9869b8cedd78996f930ac9cac3',
            '0x54b98940949b5ac0325c889c84db302d4e18faec431b48bdc81706bfe482cfbd',
            '0x28dca09fe59e9b92384074cf93fb4789da55b0b2cc3ffa69274eb3c87b7391c6',
            '0x01c42bd7e97a66166063b02fce6924e6656b6c2c61966630165095c4fb0b7b2f',
            '0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e',
            '0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2',
            '0x7e71433ddf847725166244795048ecf3e3f9f35628254ecbf736056664233493',
            '0xcdf4e344c0d23d4cdd0474039d176c55b19d531070dbe17856bfb993a5b5720b',
            '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0'
        ];
        await web3.eth.getPastLogs({fromBlock: latestBlockIndexed, toBlock: lastBlock
        }, async (error, logsRes) => {
            if (logsRes) {
                for (let log of logsRes) {
                    if (topicsWanted.includes(log.topics[0])) await extractDataFromLog(log);
                }
            }
        });

        // await sleep(10000);
        await indexBlockchain(lastBlock);
    } catch (e) {
        console.error(e);
        // await sleep(30000);
        console.log('GOT ERROR');
        await indexBlockchain(lastBlock);
    }
}

async function extractDataFromLog(log: Log) {
    const logIndexed = !!(await queryEventByTh(log.transactionHash, (log.id as string).slice(4, 12)));
    if (logIndexed) return;

    const contract = await indexContract(log.address);

    let transaction: Transaction = await queryTransaction(log.transactionHash);
    if (!transaction) {
        transaction = {...await web3.eth.getTransaction(log.transactionHash), methodId: ''};
        transaction.input = decodeFunctionFinalInput(transaction.input);
        const parameters: MethodParameter[] = await queryMethodParameters(transaction.input.slice(0, 10));
        const decodedParameters = web3.eth.abi.decodeParameters(parameters, transaction.input.slice(10));
        await tryExecuting(insertTransaction(log.transactionHash, transaction.from, transaction.to as string, transaction.value, transaction.input, transaction.blockNumber as number));
        for (let parameter of parameters) {
            await tryExecuting(insertDecodedFunctionParameter(log.transactionHash, decodedParameters[parameter.name] as string, parameter.name, parameter.type, parameter.displayType));
        }
    }

    await indexEvent(log);
}

async function indexEvent(log: Log): Promise<void> {
    try {
        const eventInterface: SolMethod = await queryMethodInterfaceWithParameters(log.topics[0].slice(0, 10));
        const eventId: number = await insertEvent(log.address, log.transactionHash, (log.id as string).slice(4, 12), log.blockNumber, log.topics[0], eventInterface.name ? eventInterface.name : '');
        await insertPost('0x' + keccak256(JSON.stringify(log)).toString('hex'), log.address, new Date(((await web3.eth.getBlock(log.blockNumber)).timestamp as number) * 1000), '', '', null, null, eventId);
        const decodedParameters = !eventInterface.name ? {} : web3.eth.abi.decodeLog(eventInterface.parameters, log.data, log.topics.filter((x, i) => i !== 0));

        for (let parameter of eventInterface.parameters.map((x) => {return {...x, value: decodedParameters[x.name]}})) {
            await insertDecodedEventParameter(eventId, parameter.value ? parameter.value : '' , parameter.name, parameter. type);
        }

        switch (eventInterface.name) {
            case 'ContractCreated':
                await indexContract(decodedParameters['contractAddress']);
                break;
            case 'Executed':
                await indexContract(decodedParameters['to']);
                const transaction = await web3.eth.getTransactionReceipt(log.transactionHash);
                for (const log of transaction.logs) {
                    // We don't add the Executed events/logs, so we avoid infinite recursive loop
                    if (!log.topics[0].includes('0x48108744') && !log.topics[0].includes('0x6b934045')) await extractDataFromLog(log);
                }
                break;
            case 'OwnershipTransferred':
                await indexContract(decodedParameters['previousOwner']);
                await indexContract(decodedParameters['newOwner']);
                break;
            case 'DataChanged':
                const th = await web3.eth.getTransaction(log.transactionHash);
                const dataChanged = decodeSetDataValue(th.input);

                for (let keyValue of dataChanged) {
                    // await analyseKey(log.address, keyValue.key, keyValue.value);
                    await tryExecuting(insertDataChanged(log.address, keyValue.key, keyValue.value, th.blockNumber as number));
                }
                break;
        }
    } catch (e) {

    }
}

async function indexContract(address: string): Promise<Contract>{
    let contract = await queryContract(address);
    if (contract) return contract;
    const contractInterface = await tryIdentifyingContract(address);
    try {
        await insertContract(address, contractInterface?.code ? contractInterface?.code : null);
        switch (contractInterface?.code) {
            case 'LSP8':
                await indexLSP8Data(address);
                break;
            case 'LSP7':
                await indexLSP7Data(address);
                break;
            case 'LSP0':
                await indexLSP3Data(address);
                break;
        }
    } catch (e) {
        console.log(e);
    }
    return {address, interfaceCode: contractInterface?.code ? contractInterface?.code : null}
}

async function extractLSP4Data(address: string): Promise<LSP4DigitalAsset> {
    const erc725Y = new ERC725(LSP4DigitalAssetJSON as ERC725JSONSchema[], address, web3.currentProvider, {ipfsGateway: 'https://2eff.lukso.dev/ipfs/'});
    let lsp4Metadata, data;

    try {
        data = await erc725Y.getData(['LSP4TokenName', 'LSP4TokenSymbol']);
        const metadataData = await erc725Y.getData('LSP4Metadata');
        const url = formatUrl((metadataData.value as URLDataWithHash).url, 'https://2eff.lukso.dev/ipfs/');
        lsp4Metadata = (await axios.get(url)).data;
    } catch (e) {
        lsp4Metadata = {value: null};
    }

    return {
        name: data && data[0].value ? data[0].value as string: '',
        symbol: data && data[1].value ? data[1].value as string: '',
        metadata: lsp4Metadata ? (lsp4Metadata as any).LSP4Metadata : initialDigitalAssetMetadata(),
    }
}

async function indexLSP3Data(address: string): Promise<void> {
    const erc725Y = new ERC725(LSP3UniversalProfileMetadataJSON as ERC725JSONSchema[], address, web3.currentProvider, {ipfsGateway: 'https://2eff.lukso.dev/ipfs/'});
    let lsp3: LSP3UniversalProfile

    try {
        const data = await erc725Y.getData('LSP3Profile');
        const url = formatUrl((data.value as URLDataWithHash).url, 'https://2eff.lukso.dev/ipfs/');
        const res = (await axios.get(url)).data;
        lsp3 = res ? (res as any).LSP3Profile as LSP3UniversalProfile : initialUniversalProfile();
    } catch (e) {
        console.error(e);
        lsp3 = initialUniversalProfile();
    }

    await insertContractMetadata(address, lsp3.name, '', lsp3.description, false, '0');
    for (let image of lsp3.backgroundImage) await tryExecuting(insertImage(address, image.url, image.width, image.height, 'background', image.hash));
    for (let image of lsp3.profileImage) await tryExecuting(insertImage(address, image.url, image.width, image.height, 'profile', image.hash));
    for (let link of lsp3.links) await tryExecuting(insertLink(address, link.title, link.url));
    for (let tag of lsp3.tags) await tryExecuting(insertTag(address, tag));
    if (lsp3.avatar) await tryExecuting(insertAsset(address, lsp3.avatar.url, lsp3.avatar.fileType, lsp3.avatar.hash));
}

async function indexLSP8Data(address: string): Promise<void> {
    const lsp4 = await extractLSP4Data(address)

    const lsp8contract = new web3.eth.Contract(LSP8IdentifiableDigitalAsset.abi as AbiItem[], address);
    const supply: string = await lsp8contract.methods.totalSupply().call();

    await indexLSP4Data(address, lsp4, true, supply);
}

async function indexLSP7Data(address: string): Promise<void> {
    const lsp4: LSP4DigitalAsset = await extractLSP4Data(address);
    const lsp7contract = new web3.eth.Contract(LSP7DigitalAsset.abi as AbiItem[], address);
    const isNFT: boolean = (await lsp7contract.methods.decimals().call()) === '0';
    const supply: string = await lsp7contract.methods.totalSupply().call();

    await indexLSP4Data(address, lsp4, isNFT, supply);
}

async function indexLSP4Data(address: string, lsp4: LSP4DigitalAsset, isNFT: boolean, supply: string) {
    await insertContractMetadata(address, lsp4.name, lsp4.symbol, lsp4.metadata.description, true, supply);
    for (let asset of lsp4.metadata.assets) await tryExecuting(insertAsset(address, asset.url, asset.fileType, asset.hash));
    for (let image of lsp4.metadata.images) await tryExecuting(insertImage(address, image.url, image.width, image.height, '', image.hash));
    for (let link of lsp4.metadata.links) await tryExecuting(insertLink(address, link.title, link.url));
    for (let icon of lsp4.metadata.icon) await tryExecuting(insertImage(address, icon.url, icon.width, icon.height, 'icon', icon.hash));
}

function decodeSetDataValue(input: string): {key: string, value: string}[] {
    switch (input.slice(0, 10)) {
        case '0x09c5eabe':
            return decodeSetDataValue(web3.eth.abi.decodeParameters([{name: 'bytes', type: 'bytes'}], input.slice(10))['bytes'] as string);
        case '0x44c028fe':
            return decodeSetDataValue(web3.eth.abi.decodeParameters(['uint256', 'address', 'uint256' ,{name: 'bytes', type: 'bytes'}], input.slice(10))['bytes'] as string);
        case '0x902d5fa0':
            return decodeSetDataValue(web3.eth.abi.decodeParameters(['bytes', 'uint256',{name: 'bytes', type: 'bytes'}], input.slice(10))['bytes'] as string);
        case '0x7f23690c':
            const decodedDataKeyValue = web3.eth.abi.decodeParameters([{name: 'key', type: 'bytes32'}, {name: 'value', type: 'bytes'}], input.slice(10));
            return [{key: decodedDataKeyValue['key'], value: decodedDataKeyValue['value']}];
        case '0x14a6e293':
            const decodedDataKeysValues = web3.eth.abi.decodeParameters([{name: 'keys', type: 'bytes32[]'}, {name: 'values', type: 'bytes[]'}], input.slice(10));
            return decodedDataKeysValues['keys'].map((x: string, i: number) => { return {key: x, value: decodedDataKeysValues['values'][i]}});
        default:
            return [];
    }
}

function decodeFunctionFinalInput(input: string): string {
    if (!input) return '';
    switch (input.slice(0, 10)) {
        case '0x09c5eabe':
            return decodeFunctionFinalInput(web3.eth.abi.decodeParameters([{name: 'bytes', type: 'bytes'}], input.slice(10))['bytes'] as string);
        case '0x44c028fe':
            return decodeFunctionFinalInput(web3.eth.abi.decodeParameters(['uint256', 'address', 'uint256' ,{name: 'bytes', type: 'bytes'}], input.slice(10))['bytes'] as string);
        case '0x902d5fa0':
            return decodeFunctionFinalInput(web3.eth.abi.decodeParameters(['bytes', 'uint256',{name: 'bytes', type: 'bytes'}], input.slice(10))['bytes'] as string);
        default:
            return input;

    }
}

async function analyseKey(address: string, key: string, value: string) {
    switch (key) {
        case '0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756': // LSP4TokenSymbol
            await updateContractSymbol(address, value);
            break;
        case '0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1': // LSP4TokenName
            await updateContractName(address, value);
            break;
        case '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e': // LSP4Metadata
            const decoded = ERC725.decodeData([{value: [{key, value}], keyName: 'LSP4Metadata'}], LSP4DigitalAssetJSON as ERC725JSONSchema[]);
            const lsp4 = (await axios.get(formatUrl(decoded[0].value.url, LUKSO_IPFS_GATEWAY))).data;
            await updateLSP4Metadata(address, lsp4 ? (lsp4 as any).LSP4Metadata : null);
            break;
        case '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5': // LSP3Profile
            const decodedJsonUrl = ERC725.decodeData([{value: [{key, value}], keyName: 'LSP3Profile'}], LSP3UniversalProfileMetadataJSON as ERC725JSONSchema[]);
            const lsp3 = (await axios.get(formatUrl(decodedJsonUrl[0].value.url, LUKSO_IPFS_GATEWAY))).data;
            await updateLSP3Profile(address, lsp3 ? (lsp3 as any).LSP3Profile : null);
            break;
    }
}

//TODO Quick and dirty, to improve
async function updateLSP4Metadata(address: string, lsp4: LSP4DigitalAssetMetadata) {
    if (!lsp4) return;

    const images: Image[] = await queryImages(address);
    const assets: Asset[] = await queryAssets(address);
    const links: Link[] = await queryLinks(address);

    await updateContractDescription(address, lsp4.description);

    const imagesToDelete = images.filter(i => !lsp4.images.map(x => x.hash).includes(i.hash) && !lsp4.icon.map(x => x.hash).includes(i.hash));
    const imagesToAdd = lsp4.images.filter(i => !images.map(x => x.hash).includes(i.hash));
    const iconsToAdd = lsp4.icon.filter(i => !images.map(x => x.hash).includes(i.hash));

    for (let image of imagesToDelete) await deleteImage(address, image.url);
    for (let image of imagesToAdd) await insertImage(address, image.url, image.width, image.height, '', image.hash);
    for (let image of iconsToAdd) await insertImage(address, image.url, image.width, image.height, 'icon', image.hash);

    const assetsToDelete = assets.filter(i => !lsp4.assets.map(x => x.hash).includes(i.hash));
    const assetsToAdd = lsp4.assets.filter(i => !assets.map(x => x.hash).includes(i.hash));

    for (let asset of assetsToDelete) await deleteAsset(address, asset.url);
    for (let asset of assetsToAdd) await insertAsset(address, asset.url, asset.fileType, asset.hash);

    const linksToDelete = links.filter(i => !lsp4.links.map(x => x.url).includes(i.url));
    const linksToAdd = lsp4.links.filter(i => !links.map(x => x.url).includes(i.url));

    for (let link of linksToDelete) await deleteLink(address, link.title, link.url);
    for (let link of linksToAdd) await insertLink(address, link.title, link.url);
}

//TODO Quick and dirty, to improve, improve comparison (ex: if 2 images are the same (same hash) but one is for bg an other for profile we need to compare hash AND type)
async function updateLSP3Profile(address: string, lsp3: LSP3UniversalProfile) {
    if (!lsp3) return;

    const images: Image[] = await queryImages(address);
    const links: Link[] = await queryLinks(address);
    const tags: string[] = await queryTags(address);

    await updateContractDescription(address, lsp3.description);
    await updateContractName(address, lsp3.name);

    const imagesToDelete = images.filter(i => !lsp3.profileImage.map(x => x.hash).includes(i.hash) && !lsp3.backgroundImage.map(x => x.hash).includes(i.hash));
    const profileImagesToAdd = lsp3.profileImage.filter(i => !images.map(x => x.hash).includes(i.hash));
    const backgroundImagesToAdd = lsp3.backgroundImage.filter(i => !images.map(x => x.hash).includes(i.hash));

    for (let image of imagesToDelete) await deleteImage(address, image.url);
    for (let image of profileImagesToAdd) await insertImage(address, image.url, image.width, image.height, 'profile', image.hash);
    for (let image of backgroundImagesToAdd) await insertImage(address, image.url, image.width, image.height, 'background', image.hash);

    const linksToDelete = links.filter(i => !lsp3.links.map(x => x.url).includes(i.url));
    const linksToAdd = lsp3.links.filter(i => !links.map(x => x.url).includes(i.url));

    for (let link of linksToDelete) await deleteLink(address, link.title, link.url);
    for (let link of linksToAdd) await insertLink(address, link.title, link.url);

    const tagsToDelete = tags.filter(i => !lsp3.tags.includes(i));
    const tagsToAdd = lsp3.tags.filter(i => !tags.includes(i));

    for (let tag of tagsToDelete) await deleteTag(address, tag);
    for (let tag of tagsToAdd) await insertTag(address, tag);
}

async function tryIdentifyingContract(address: string): Promise<ContractInterface | undefined> {
    try {
        const contractCode = await web3.eth.getCode(address);
        const contractInterfaces: ContractInterface[] = await queryContractInterfaces();

        for (let i = 0 ; i < contractInterfaces.length ; i++) {
            if (contractCode.includes(contractInterfaces[i].id.slice(2, 10))) return contractInterfaces[i];
        }
        const contract = new web3.eth.Contract(LSP0ERC725Account.abi as AbiItem[], address);

        for (let i = 0 ; i < contractInterfaces.length ; i++) {
            if (await contract.methods.supportsInterface(contractInterfaces[i].id).call()) return contractInterfaces[i];
        }
    } catch (e) {
        return undefined;
    }

    return undefined;
}

async function tryExecuting(f: Promise<any>) {
    try {
        await f;
    } catch (e) {
        // console.error(e);
    }
}