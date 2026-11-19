// apps/backend/src/database/database.types.ts
import { QueryResult, QueryResultRow } from 'pg';

export interface IDbExecutor {
  query<R extends QueryResultRow = QueryResultRow>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<QueryResult<R>>;
  queryRows<R extends QueryResultRow = QueryResultRow>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<R[]>;
  queryOne<R extends QueryResultRow = QueryResultRow>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<R | null>;
}

export type TransactionCallback<T> = (client: IDbExecutor) => Promise<T>;

export interface DatabaseHealthStatus {
  status: 'healthy' | 'unhealthy';
  latencyMs?: number;
  activeConnections?: number;
  totalConnections?: number;
  idleConnections?: number;
  error?: string;
}
