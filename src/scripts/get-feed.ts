import {insertFollow, queryFollowing} from "../bin/db/follow.table";
import {insertContract} from "../bin/db/contract.table";
import {insertMethodInterface} from "../bin/db/method-interface.table";
import {insertContractInterface} from "../bin/db/contract-interface.table";
import Web3 from "web3";
import {EthLogs} from "../bin/EthLogs/EthLogs.class";
import {topicToEvent} from "../bin/EthLogs/data-extracting/utils/event-identification";

async function main() {
    await getFeed('0xA5284665954a54d12737Da405824160cCE05B0B0');
}

async function getFeed(user: string) {
    const start = new Date();
    const searchStep = 200000;
    const following: string[] = await queryFollowing(user);
    console.log(following);
    const web3 = new Web3('https://rpc.l16.lukso.network');
    const logs: EthLogs = new EthLogs(topicToEvent, web3.currentProvider);
    let latestBlock: number = await web3.eth.getBlockNumber();

    for (let block = latestBlock ; block > 0 ; block -= searchStep) {
        for (let address of following) {
            console.log(block)
            await web3.eth.getPastLogs({
                fromBlock: block - searchStep, toBlock: block, address
            }, async (error, logsRes) => {
                logs.addLogsAndExtract(logsRes);
            })
        }
        console.log('found : ' + logs.lenght);
        if (logs.lenght >= 20) {
            latestBlock = block;
            break;
        }
    }
    console.log(latestBlock);
    console.log(logs.lenght);
    const end = new Date();
    const exectime = end.getTime() - start.getTime();
    console.log('execution time = ' + exectime );
    return;
}

main();