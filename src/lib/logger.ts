import { LOGGER } from '../environment/config';

export function logMessage(message: any) {
  if (LOGGER) console.log(message);
}

export function logError(message: any) {
  if (LOGGER) console.error(message);
}
