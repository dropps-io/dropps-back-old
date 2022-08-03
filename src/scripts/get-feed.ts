import {insertFollow, queryFollowing} from "../bin/db/follow.table";
import {insertContract} from "../bin/db/contract.table";
import {insertMethodInterface} from "../bin/db/method-interface.table";
import {insertContractInterface} from "../bin/db/contract-interface.table";
import Web3 from "web3";
import {EthLogs} from "../bin/EthLogs/EthLogs.class";
import {topicToEvent} from "../bin/EthLogs/data-extracting/utils/event-identification";
import {isGeneratorFunction} from "util/types";

async function getFeed(user: string) {
    const start = new Date();
    const searchStep = 200000;
    const following: string[] = await queryFollowing(user);
    console.log(following);
    const web3 = new Web3('https://rpc.l16.lukso.network');
    const logs: EthLogs = new EthLogs(topicToEvent, web3.currentProvider);
    let latestBlock: number = await web3.eth.getBlockNumber();

    for (let block = latestBlock ; block > 0 ; block - searchStep > 0 ? block -= searchStep : block = 0 ) {
        for (let i = 0; i < 400 ; i++) {
            try {
                const from = block - searchStep > 0 ? block - searchStep : 0;
                await web3.eth.getPastLogs({
                    fromBlock: from, toBlock: block, address: '0xA5284665954a54d12737Da405824160cCE05B0B0'
                }, async (error, logsRes) => {
                    if (logsRes) logs.addLogs(logsRes);
                });
            } catch (e) {
                console.error(e);
            }
        }
        console.log('found : ' + logs.length);
        if (logs.length >= 40) {
            latestBlock = block;
            break;
        }
    }
    console.log(latestBlock);
    console.log(logs.length);
    const end = new Date();
    const exectime = end.getTime() - start.getTime();
    console.log('execution time = ' + exectime );
    return;
}

