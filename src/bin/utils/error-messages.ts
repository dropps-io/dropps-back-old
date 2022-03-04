export const USER_NOT_FOUND = 'User not found';
export const USER_EXISTS = 'User already exists';

export const ADR_INVALID = 'Invalid address format';
export const ADR_NOT_EQUAL_PARAM_BODY = 'Body and param address should be equal';

export const UP_NO_PERMISSIONS = 'User do not have permissions on this universal profile';
export const INTERNAL = 'Internal Error';

export const USER_PROFILE_RELATION_NOT_FOUND = 'Cannot find user-profile relation'
export const USER_PROFILE_RELATION_EXISTS = 'User-profile relation already exists'

export function error(code: number, message: string): { code: number, message: string } {
  return {
    code,
    message
  };
}
