import ERC725, {ERC725JSONSchema} from '@erc725/erc725.js';
import axios from 'axios';
import {formatUrl} from '../../../bin/utils/format-url';
import LSP4DigitalAssetJSON from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import LSP3UniversalProfileMetadataJSON from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import {KEY_LSPXXSocialRegistry} from '../../../bin/utils/constants';
import {Log} from '../../../models/types/log';
import {web3} from '../../../bin/web3/web3';
import {URLDataWithHash} from '@erc725/erc725.js/build/main/src/types/encodeData/JSONURL';
import {IPFS_GATEWAY} from '../../../environment/config';
import {incrementExtractedToLogOf, reportIndexingScriptError} from '../index-logger';
import {extractAndIndexRegistry} from '../extract-and-index';
import {indexUpdateName, indexUpdateSymbol} from '../indexing/index-update';
import {LSP3UniversalProfile} from '../../../bin/UniversalProfile/models/lsp3-universal-profile.model';
import {updateLSP4Metadata} from '../indexing/update-lsp4';
import {updateLSP3Profile} from '../indexing/update-lsp3';

async function extractAndIndexLSP4Symbol(log: Log, lastBlock: number, erc725Y: ERC725, key: string, value?: string) {
	// We want to fetch the latest value if we have no value (obviously) OR if the log is old (meaning the value probably changed in the meantime)
	if (value && log.blockNumber > lastBlock - 10) {
		const symbol: string = erc725Y.decodeData([{value: [{key, value}], keyName: 'LSP4TokenSymbol'}], LSP4DigitalAssetJSON as ERC725JSONSchema[]).value as string;
		await indexUpdateSymbol(log.address, symbol);
	} else {
		const symbol: string = (await erc725Y.getData('LSP4TokenSymbol')).value as string;
		if (symbol) await indexUpdateSymbol(log.address, symbol);
	}
}

async function extractAndIndexLSP4Name(log: Log, lastBlock: number, erc725Y: ERC725, key: string, value?: string) {
	// We want to fetch the latest value if we have no value (obviously) OR if the log is old (meaning the value probably changed in the meantime)
	if (value && log.blockNumber > lastBlock - 10) {
		const name: string = erc725Y.decodeData([{value: [{key, value}], keyName: 'LSP4TokenName'}], LSP4DigitalAssetJSON as ERC725JSONSchema[]).value as string;
		await indexUpdateName(log.address, name);
	} else {
		const name: string = (await erc725Y.getData('LSP4TokenName')).value as string;
		if (name) await indexUpdateName(log.address, name);
	}
}

async function extractAndIndexLSP4Metadata(log: Log, lastBlock: number, key: string, erc725Y: ERC725, value?: string) {
	// We want to fetch the latest value if we have no value (obviously) OR if the log is old (meaning the value probably changed in the meantime)
	if (value && log.blockNumber > lastBlock - 10) {
		const decoded = ERC725.decodeData([{value: [{key, value}], keyName: 'LSP4Metadata'}], LSP4DigitalAssetJSON as ERC725JSONSchema[]);
		const lsp4 = (await axios.get(formatUrl(decoded[0].value.url))).data;
		await updateLSP4Metadata(log.address, lsp4 ? (lsp4 as any).LSP4Metadata : null);
	} else {
		const metadataData = await erc725Y.getData('LSP4Metadata');
		const url = formatUrl((metadataData.value as URLDataWithHash).url);
		const lsp4Metadata = (await axios.get(url)).data;
		await updateLSP4Metadata(log.address, lsp4Metadata ? (lsp4Metadata as any).LSP4Metadata : null);
	}
}

async function extractAndIndexLSP3Profile(log: Log, lastBlock: number, key: string, erc725Y: ERC725, value?: string) {
	// We want to fetch the latest value if we have no value (obviously) OR if the log is old (meaning the value probably changed in the meantime)
	if (value && log.blockNumber > lastBlock - 10) {
		const decodedJsonUrl = ERC725.decodeData([{value: [{key, value}], keyName: 'LSP3Profile'}], LSP3UniversalProfileMetadataJSON as ERC725JSONSchema[]);
		const lsp3 = (await axios.get(formatUrl(decodedJsonUrl[0].value.url))).data;
		await updateLSP3Profile(log.address, lsp3 ? (lsp3 as any).LSP3Profile : null);
	} else {
		const metadataData = await erc725Y.getData('LSP3Profile');
		const url = formatUrl((metadataData.value as URLDataWithHash).url);
		const res = (await axios.get(url)).data;
		if (!res) return;
		await updateLSP3Profile(log.address, (res as any).LSP3Profile as LSP3UniversalProfile);
	}
}

export async function extractDataFromKey(log: Log, lastBlock: number, key: string, value?: string) {
	const erc725Y = new ERC725((LSP4DigitalAssetJSON as ERC725JSONSchema[]).concat(LSP3UniversalProfileMetadataJSON as ERC725JSONSchema[]), log.address, web3.currentProvider, {ipfsGateway: IPFS_GATEWAY});

	try {
		switch (key) {
		case '0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756': // LSP4TokenSymbol
			await extractAndIndexLSP4Symbol(log, lastBlock, erc725Y, key, value);
			break;
		case '0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1': // LSP4TokenName
			await extractAndIndexLSP4Name(log, lastBlock, erc725Y, key, value);
			break;
		case '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e': // LSP4Metadata
			await extractAndIndexLSP4Metadata(log, lastBlock, key, erc725Y, value);
			break;
		case '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5': // LSP3Profile
			await extractAndIndexLSP3Profile(log, lastBlock, key, erc725Y, value);
			break;
		case KEY_LSPXXSocialRegistry:
			await extractAndIndexRegistry(log, lastBlock, value);
			break;
		}
	} catch (e: any) {
		if (!e.toString().includes('Chosen hashFunction'))
			await reportIndexingScriptError('extractDataFromKey', e);
	}
	incrementExtractedToLogOf('dataChanged');
}