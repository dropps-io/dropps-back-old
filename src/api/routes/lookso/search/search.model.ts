import { Transaction } from '../../../../models/types/transaction';

export interface SearchResults {
  profiles: {
    count: number;
    results: { address: string; name: string; image: string }[];
  };
  transactions: { count: number; results: Transaction[] };
}
