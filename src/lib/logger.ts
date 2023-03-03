import winston from 'winston';
import { LOGGER } from '../environment/config';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),

  transports: [new winston.transports.Console()],
});

export function logMessage(message: any) {
  if (LOGGER) logger.info(message);
}

export function logError(message: any) {
  if (LOGGER) logger.error(message);
}
