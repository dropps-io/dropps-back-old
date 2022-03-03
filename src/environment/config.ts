import config from 'config';

export const ENV = config.get('env');
export const JWT_VALIDITY_TIME = config.get('jwt_validity_time');
export const LOGGER: boolean = config.get('logger');
