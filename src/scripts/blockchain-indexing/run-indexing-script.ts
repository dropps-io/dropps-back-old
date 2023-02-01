import {indexBlockchain} from './index-blockchain';
import {INDEX_FROM_BLOCK} from './config';


async function run() {
	await indexBlockchain(INDEX_FROM_BLOCK);
}

run();