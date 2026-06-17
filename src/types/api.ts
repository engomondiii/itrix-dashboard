/** Generic API envelope + pagination shared by all resources. */

export interface Paginated<T> {
  results: T[];
  count: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  detail: string;
  code?: string;
  fields?: Record<string, string[]>;
}

export type SortDir = "asc" | "desc";

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  dir?: SortDir;
}
