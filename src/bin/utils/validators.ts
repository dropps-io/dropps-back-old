export function isAddress(supposedAddress: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(supposedAddress);
}

export function isHash(supposedAddress: string): boolean {
	return /^0x[a-fA-F0-9]{64}$/.test(supposedAddress);
}
