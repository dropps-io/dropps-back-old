import Web3 from "web3";
import {extractDataFromLog} from "./data-extraction/extract-log";
import {sleep} from "./utils/sleep";
import {BLOCK_ITERATION, SLEEP_BETWEEN_ITERATION} from "./config";

const web3 = new Web3('https://rpc.l16.lukso.network');

export async function indexBlockchain(latestBlockIndexed: number) {
    let lastBlock: number = 0;
    try {
        lastBlock = await web3.eth.getBlockNumber();
        if (lastBlock - latestBlockIndexed > BLOCK_ITERATION) lastBlock = latestBlockIndexed + BLOCK_ITERATION;

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

        await sleep(SLEEP_BETWEEN_ITERATION);
        await indexBlockchain(lastBlock);
    } catch (e) {
        console.error(e);
        // await sleep(30000);
        console.log('GOT ERROR');
        await indexBlockchain(lastBlock);
    }
}


// export async function indexTx(txHash: string) {
//   const receipt = await web3.eth.getTransactionReceipt(txHash);
//   for (const log in receipt.logs) {
//     await  extractDataFromLog(JSON.parse(log));
//   }
// }

