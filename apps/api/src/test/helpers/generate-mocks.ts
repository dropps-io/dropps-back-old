import keccak256 from 'keccak256';

export function generateRandomKeccakHash(): string {
  return '0x' + keccak256(Math.random().toString()).toString('hex');
}

export function generateRandomAddress(): string {
  return '0x' + keccak256(Math.random().toString()).toString('hex').slice(0, 40);
}
