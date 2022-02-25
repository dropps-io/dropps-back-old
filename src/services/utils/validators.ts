export function isAddress(supposedAddress: string): boolean {
  if (supposedAddress.length !== 42) return false;
  if (supposedAddress.substring(0,2).toUpperCase() !== '0X') return false;
  return /^[0-9a-zA-Z]+$/.test(supposedAddress);
}
