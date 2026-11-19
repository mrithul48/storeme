// apps/backend/src/database/migrations/runner.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load root .env or backend .env
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import * as fs from 'fs';
import { Pool } from 'pg';
import { getDatabasePoolConfig } from '../database.config';

export async function runMigrations(): Promise<void> {
  const config = getDatabasePoolConfig();
  const pool = new Pool(config);

  console.log('--- LaunchCommerce Native PostgreSQL Migration Runner ---');
  console.log(`Target database: ${config.connectionString?.split('@')[1] || 'localhost'}`);

  const client = await pool.connect();
  try {
    // 1. Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "schema_migrations" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) UNIQUE NOT NULL,
        "appliedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Read migration files
    const migrationsDir = __dirname;
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration file(s) in ${migrationsDir}`);

    // 3. Apply pending migrations
    for (const file of files) {
      const alreadyApplied = await client.query(
        'SELECT 1 FROM "schema_migrations" WHERE "name" = $1',
        [file],
      );

      if (alreadyApplied.rowCount && alreadyApplied.rowCount > 0) {
        console.log(`  [SKIP] ${file} (already applied)`);
        continue;
      }

      console.log(`  [APPLYING] ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO "schema_migrations" ("name") VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
        console.log(`  [SUCCESS] ${file}`);
      } catch (err: unknown) {
        await client.query('ROLLBACK');
        const message = err instanceof Error ? err.message : String(err);
        console.error(`  [FAILED] ${file}: ${message}`);
        throw err;
      }
    }

    console.log('All migrations applied successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration execution completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration execution failed:', err);
      process.exit(1);
    });
}
