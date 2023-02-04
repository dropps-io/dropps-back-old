import { LOGGER } from '../environment/config';

/* eslint-disable */
export function logMessage(message: any) {
	if (LOGGER) console.log(message);
}
/* eslint-disable */
export function logError(message: any) {
	if (LOGGER) console.error(message);
}
