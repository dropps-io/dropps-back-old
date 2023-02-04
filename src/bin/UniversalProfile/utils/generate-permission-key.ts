export function generatePermissionKey(address: string): string {
  return '0x4b80742de2bf82acb3630000' + address.substring(2, 42);
}
