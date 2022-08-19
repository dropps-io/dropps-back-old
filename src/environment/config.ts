import config from 'config';

export const ENV = config.get('env');
export const JWT_VALIDITY_TIME: number = config.get('jwt_validity_time');
export const LOGGER: boolean = config.get('logger');
export const MAX_IMAGE_SIZE: boolean = config.get('max_image_size');
