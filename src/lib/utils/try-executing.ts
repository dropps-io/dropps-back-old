import { logError } from '../logger';

export async function tryExecuting(f: Promise<any>) {
  try {
    return await f;
  } catch (e) {
    logError('Failed to execute f:');
    logError(e);
    return undefined;
  }
}
