export async function tryExecuting(f: Promise<any>) {
  try {
    return await f;
  } catch (e) {
    console.error('Failed to execute f:');
    console.error(e);
    return undefined;
  }
}