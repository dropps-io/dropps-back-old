import {Log} from '../../models/types/log';
import {queryContract} from '../../bin/db/contract.table';
import {extractContract} from './extraction/extract-contract';
import {ContractFullMetadata} from './models/contract-metadata.model';
import {queryTransaction} from '../../bin/db/transaction.table';
import {Transaction} from '../../models/types/transaction';
import {extractTransaction} from './extraction/extract-transaction';
import {extractLog} from './extraction/extract-log';
import {extractRegistry, RegistryChangesToIndex} from './extraction/extract-registry';
import {queryEventByTh} from '../../bin/db/event.table';
import {extractAndIndexDataChangedEvent} from './extraction/extract-data-changed';
import {POST_VALIDATOR_ADDRESS} from '../../environment/config';
import {KEY_LSPXXSocialRegistry} from '../../bin/utils/constants';
import {indexEvent} from './indexing/index-event';
import {indexTransaction} from './indexing/index-transaction';
import {MethodParameter} from '../../models/types/method-parameter';
import {indexContract} from './indexing/index-contract';
import {setLogExtractingToLog} from './index-logger';
import {indexRegistry} from './indexing/index-registry';

export async function extractAndIndexBatch(logs: Log[], lastBlock: number) {
	for (let i = 0 ; i < logs.length ; i++) {
		setLogExtractingToLog(logs[i]);
		await extractAndIndex(logs[i], lastBlock);
	}
}

async function extractAndIndex(log: Log, lastBlock: number) {
	let tx: {transaction: Transaction, params: MethodParameter[], decodedParams: { [key: string]: any }};

	await extractAndIndexContract(log.address);

	try {
		await queryTransaction(log.transactionHash);
	} catch (e) {
		tx = await extractTransaction(log.transactionHash);
		await indexTransaction(tx.transaction, tx.params, tx.decodedParams);
	}

	await extractAndIndexLog(log, lastBlock);
}

async function extractAndIndexLog(log: Log, lastBlock: number) {
	let event;
	try {
		await queryEventByTh(log.transactionHash, (log.id as string).slice(4, 12));
	} catch (e) {
		try {
			event = await extractLog(log);

			// If (event related to the registry, do not index it as a post (so it does not appear in the feed)
			if (!(POST_VALIDATOR_ADDRESS.includes(event.params['to']) || (event.params['dataKey'] && event.params['dataKey'] === KEY_LSPXXSocialRegistry))) {
				await indexEvent(log, event.params, event.eventInterface);
			}

			switch (event.eventInterface.name) {
			case 'ContractCreated':
				await extractAndIndexContract(event.params['contractAddress']);
				break;
			case 'Executed':
				await extractAndIndexContract(event.params['to']);
				break;
			case 'OwnershipTransferred':
				await extractAndIndexContract(event.params['previousOwner']);
				await extractAndIndexContract(event.params['newOwner']);
				break;
			case 'UniversalReceiver':
				await extractAndIndexContract(event.params['from']);
				break;
			case 'DataChanged':
				await extractAndIndexDataChangedEvent(log, event.params, lastBlock);
				break;
			}
		} catch (e) {
			await indexEvent(log, {});
			return;
		}
	}
}

export async function extractAndIndexContract(address: string) {
	if (!address) return;

	const runIndexing = async (exists?: boolean) => {
		contract = await extractContract(address);
		await indexContract(address, contract.interfaceCode, contract.metadata, exists);
	};

	let contract: { metadata: ContractFullMetadata | null, interfaceCode: string | null };
	try {
		const res = await queryContract(address);
		if (res.interfaceCode === null) await runIndexing(true);
	}
	catch (e) {
		await runIndexing();
	}
}

export async function extractAndIndexRegistry(log: Log, lastBlock: number, jsonUrl?: string) {
	let registryChangesToIndex: RegistryChangesToIndex;
	if (jsonUrl && log.blockNumber > lastBlock - 10) {
		registryChangesToIndex = await extractRegistry(log, jsonUrl);
	} else {
		registryChangesToIndex = await extractRegistry(log);
	}
	await indexRegistry(log, registryChangesToIndex);
}