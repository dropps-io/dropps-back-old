/* eslint-disable */
export async function throwError(f: Promise<any>): Promise<boolean> {
	try {
		await f;
		return false;
	} catch (e) {
		return true;
	}
}
