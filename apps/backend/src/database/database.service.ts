// apps/backend/src/database/database.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { getDatabasePoolConfig } from './database.config';
import {
  IDbExecutor,
  TransactionCallback,
  DatabaseHealthStatus,
} from './database.types';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: Pool;

  onModuleInit(): void {
    const config = getDatabasePoolConfig();
    this.pool = new Pool(config);

    this.pool.on('error', (err: Error) => {
      this.logger.error(`Unexpected PostgreSQL idle client error: ${err.message}`, err.stack);
    });

    this.pool.on('connect', () => {
      this.logger.debug('New PostgreSQL connection established in pool');
    });

    this.logger.log('PostgreSQL connection pool initialized');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      this.logger.log('Closing PostgreSQL connection pool...');
      await this.pool.end();
      this.logger.log('PostgreSQL connection pool closed');
    }
  }

  /**
   * Execute raw query returning QueryResult metadata.
   */
  async execute<R extends QueryResultRow = QueryResultRow>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<QueryResult<R>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<R>(sql, values ? [...values] : undefined);
      const duration = Date.now() - start;
      if (duration > 1000) {
        this.logger.warn(`Slow query detected (${duration}ms): ${sql.substring(0, 100)}...`);
      }
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Database query failed: ${message} | SQL: ${sql.substring(0, 150)}`);
      throw error;
    }
  }

  /**
   * Execute a parameterized SQL query on the pool and return the typed rows array.
   */
  async query<R extends QueryResultRow = QueryResultRow>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<R[]> {
    const res = await this.execute<R>(sql, values);
    return res.rows;
  }

  /**
   * Execute a query and return a single row or null.
   */
  async queryOne<R extends QueryResultRow = QueryResultRow>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<R | null> {
    const rows = await this.query<R>(sql, values);
    return rows[0] ?? null;
  }

  /**
   * Execute multiple operations within an atomic database transaction.
   * Automatically BEGINs, COMMITs on success, or ROLLBACKs on error.
   * Releases client back to pool in finally block.
   */
  async withTransaction<T>(callback: TransactionCallback<T>): Promise<T> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const executor: IDbExecutor = {
        query: <R extends QueryResultRow = QueryResultRow>(sql: string, values?: readonly unknown[]) =>
          client.query<R>(sql, values ? [...values] : undefined),
        queryRows: async <R extends QueryResultRow = QueryResultRow>(sql: string, values?: readonly unknown[]) => {
          const res = await client.query<R>(sql, values ? [...values] : undefined);
          return res.rows;
        },
        queryOne: async <R extends QueryResultRow = QueryResultRow>(sql: string, values?: readonly unknown[]) => {
          const res = await client.query<R>(sql, values ? [...values] : undefined);
          return res.rows[0] ?? null;
        },
      };
      const result = await callback(executor);
      await client.query('COMMIT');
      return result;
    } catch (err: unknown) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Perform a lightweight healthcheck query to verify connection viability and measure latency.
   */
  async healthCheck(): Promise<DatabaseHealthStatus> {
    const start = Date.now();
    try {
      await this.pool.query('SELECT 1');
      const latencyMs = Date.now() - start;
      return {
        status: 'healthy',
        latencyMs,
        activeConnections: this.pool.totalCount - this.pool.idleCount,
        totalConnections: this.pool.totalCount,
        idleConnections: this.pool.idleCount,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: 'unhealthy',
        latencyMs: Date.now() - start,
        error: message,
      };
    }
  }
}
