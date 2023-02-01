import {Log} from '../../../models/types/log';
import {Transaction} from '../../../models/types/transaction';
import {queryTransaction} from '../../../bin/db/transaction.table';
import {MethodParameterTable} from '../../../models/types/tables/method-parameter-table';
import {queryMethodParameters} from '../../../bin/db/method-parameter.table';
import {web3} from '../../../bin/web3/web3';
import {indexTransaction} from '../data-indexing/index-transaction';
import {SolMethod} from '../../../models/types/sol-method';
import {queryMethodInterfaceWithParameters} from '../../../bin/db/method-interface.table';
import {extractContract} from './extract-contract';
import {decodeTransactionFinalInput} from '../utils/tx-final-input';
import {indexEvent} from '../data-indexing/index-event';
import {decodeSetDataValueFromInput} from '../utils/set-data-from-input';
import {extractDataFromKey} from './extract-key-data';
import {indexDataChanged} from '../data-indexing/index-data-changed';
import {logError} from '../../../bin/logger';
import {POST_VALIDATOR_ADDRESS} from '../../../environment/config';
import {KEY_LSPXXSocialRegistry} from '../../../bin/utils/constants';

export async function extractDataFromLog(log: Log) {
	await extractContract(log.address);

	let transaction: Transaction = await queryTransaction(log.transactionHash);
	if (!transaction) {
		transaction = {...await web3.eth.getTransaction(log.transactionHash), methodId: ''};
		transaction.input = decodeTransactionFinalInput(transaction.input);
		const parameters: MethodParameterTable[] = await queryMethodParameters(transaction.input.slice(0, 10));
		let decodedParameters: { [key: string]: any; } = {};
		try {
			decodedParameters = web3.eth.abi.decodeParameters(parameters, transaction.input.slice(10));
		} catch (e) {
			logError('Failed to decode parameters:');
			logError(e);
		}
		await indexTransaction(transaction, log, parameters, decodedParameters);
	}

	await extractEvent(log);
}

async function extractEvent(log: Log): Promise<void> {
	try {
		const eventInterface: SolMethod = await queryMethodInterfaceWithParameters(log.topics[0].slice(0, 10));
		const decodedParameters = !eventInterface.name ? {} : web3.eth.abi.decodeLog(eventInterface.parameters, log.data, log.topics.filter((x, i) => i !== 0));

		if (!(POST_VALIDATOR_ADDRESS.includes(decodedParameters['to']) || (decodedParameters['dataKey'] && decodedParameters['dataKey'] === KEY_LSPXXSocialRegistry))) {
			await indexEvent(log, decodedParameters, eventInterface);
		}

		switch (eventInterface.name) {
		case 'ContractCreated':
			await extractContract(decodedParameters['contractAddress']);
			break;
		case 'Executed':
			await extractContract(decodedParameters['to']);
			const transaction = await web3.eth.getTransactionReceipt(log.transactionHash);
			for (const log of transaction.logs) {
				// We don't add the Executed events/logs, so we avoid infinite recursive loop
				if (!log.topics[0].includes('0x48108744') && !log.topics[0].includes('0x6b934045')) await extractDataFromLog(log);
			}
			break;
		case 'OwnershipTransferred':
			extractContract(decodedParameters['previousOwner']);
			extractContract(decodedParameters['newOwner']);
			break;
		case 'UniversalReceiver':
			extractContract(decodedParameters['from']);
			break;
		case 'DataChanged':
			const th = await web3.eth.getTransaction(log.transactionHash);
			const dataChanged: {key: string, value: string}[] = decodeSetDataValueFromInput(th.input);
			if (dataChanged.length === 0) await extractDataFromKey(log, decodedParameters['dataKey']);

			for (const keyValue of dataChanged) {
				await extractDataFromKey(log, keyValue.key, keyValue.value);
				indexDataChanged(log.address, keyValue.key, keyValue.value, th.blockNumber as number);
			}
			break;
		}
	} catch (e) {
		logError(e);
	}
}