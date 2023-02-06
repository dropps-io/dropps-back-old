import { PaginationResponse } from '../../models/types/pagination';

export const defaultPaginationResWithResults: PaginationResponse & { results: any[] } = {
  count: 0,
  page: 0,
  next: null,
  previous: null,
  results: [],
};
