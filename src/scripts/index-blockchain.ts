import Web3 from "web3";
import {EthLogs} from "../bin/EthLogs/EthLogs.class";
import {topicToEvent} from "../bin/EthLogs/data-extracting/utils/event-identification";
import {Log} from "../bin/EthLogs/EthLog.models";
import {queryEventByTh} from "../bin/db/event.table";
import {insertContract, queryContract} from "../bin/db/contract.table";
import {Contract} from "../models/types/contract";
import {queryContractInterfaces} from "../bin/db/contract-interface.table";
import {ContractInterface} from "../models/types/contract-interface";
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
        const logsRepo: EthLogs = new EthLogs(topicToEvent, 'https://rpc.l16.lukso.network');
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

    let contract = await queryContract(log.address);
    if (!contract) contract = await indexContract(log.address);
}

async function indexContract(address: string): Promise<Contract>{
    const contractInterface = await tryIdentifyingContract(address);
    try {
        await insertContract(address, contractInterface?.code ? contractInterface?.code : null);
    } catch (e) {
        console.log(e);
    }
    return {address, interfaceCode: contractInterface?.code ? contractInterface?.code : null}
}

export async function tryIdentifyingContract(address: string): Promise<ContractInterface | undefined> {
    const contractCode = await web3.eth.getCode(address);
    console.log(contractCode)
    const contractInterfaces: ContractInterface[] = await queryContractInterfaces();
    console.log(contractInterfaces)

    for (let i = 0 ; i < contractInterfaces.length ; i++) {
        if (contractCode.includes(contractInterfaces[i].id.slice(2, 10))) return contractInterfaces[i];
    }

    return undefined;
}