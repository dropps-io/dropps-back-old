export const ERROR_USER_NOT_FOUND = 'User not found';
export const ERROR_USER_EXISTS = 'User already exists';

export const ERROR_NOT_FOUND = 'Entry not found';
export const ERROR_EXISTS = 'Entry already exists';

export const ERROR_ADR_INVALID = 'Invalid address format';
export const ERROR_HASH_INVALID = 'Invalid hash format';
export const ERROR_ADR_NOT_EQUAL_PARAM_BODY = 'Body and param address should be equal';

export const ERROR_UP_NO_PERMISSIONS = 'User do not have permissions on this universal profile';
export const ERROR_INTERNAL = 'Internal Error';

export const ERROR_USER_PROFILE_RELATION_NOT_FOUND = 'Cannot find user-profile relation';
export const ERROR_USER_PROFILE_RELATION_EXISTS = 'User-profile relation already exists';

export const ERROR_INCORRECT_SIGNED_NONCE = 'The signed nonce do not correspond to the user';
export const ERROR_INVALID_SIGNATURE = 'The signature format is not valid';

export const ERROR_NO_JWT_TOKEN = 'No JWT token provided with bearer';
export const ERROR_JWT_EXPIRED = 'The JWT token provided is expired';
export const ERROR_UNAUTHORIZED = 'You don\'t have the permission to access this resource';

export const ERROR_PROFILE_NOT_FOUND = 'Cannot find the Universal Profile';

export const RESOURCE_EXISTS = 'Resource already exists';

export const PUSH_REGISTRY_REQUIRED = 'Push to registry required';

export const FILE_TYPE_NOT_SUPPORTED = 'This file type is not supported';

export function error(code: number, message: string): { code: number, message: string } {
	return {
		code,
		message
	};
}
