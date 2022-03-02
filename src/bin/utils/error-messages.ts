export const USER_NOT_FOUND = 'User not found';
export const USER_EXISTS = 'User already exists';

export const ADR_INVALID = 'Invalid address format';
export const ADR_NOT_EQUAL_PARAM_BODY = 'Body and param address should be equal';

export const UP_NO_PERMISSIONS = 'User do not have permissions on this universal profile';
export const INTERNAL = 'Internal Error';

export const USER_PROFILE_RELATION_NOT_FOUND = 'Cannot find user-profile relation';
export const USER_PROFILE_RELATION_EXISTS = 'User-profile relation already exists';

export const INCORRECT_SIGNED_NONCE = 'The signed nonce do not correspond to the user';
export const INVALID_SIGNATURE = 'The signature format is not valid';

export const NO_JWT_TOKEN = 'No JWT token provided with bearer';
export const JWT_EXPIRED = 'The JWT token provided is expired';
export const UNAUTHORIZED = 'You don\'t have the permission to access this resource';

export function error(code: number, message: string): { code: number, message: string } {
	return {
		code,
		message
	};
}
