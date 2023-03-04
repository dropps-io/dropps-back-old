export interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  input: string;
  blockNumber: number | null;
  methodId: string;
}
