export function generateAddressPermissionsKey(address: string): string {
    return '0x4b80742d0000000082ac0000' + address.substring(2, 42);
}
