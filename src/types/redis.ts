export interface RedisSearchResult<T> {
  total: number;
  documents: { id: string; value: T }[];
}
