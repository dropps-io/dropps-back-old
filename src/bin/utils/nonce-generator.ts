export function generateRandomNonce(): string {
	return (Math.floor(Math.random() * 100000000)).toString();
}
