import {fromUtf8, toUtf8} from 'ethereumjs-util';
import keccak256 from 'keccak256';
import {objectToKeccak256Hash} from './file-converters';

export function buildJsonUrl(object: any, url: string): string {
	const hashFunction = keccak256('keccak256(utf8)').toString('hex').substring(0, 10);
	const hash = objectToKeccak256Hash(object);
	return '0x' + hashFunction + hash.substring(2) + fromUtf8(url).substring(2);
}

export const decodeJsonUrl = (jsonUrl: string): string => {
	return toUtf8(jsonUrl.slice(74));
};