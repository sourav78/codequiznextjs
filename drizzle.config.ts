import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// check if DATABASE_URL is defined
// if not, throw an error
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// This is the configuration file for drizzle-kit
// It is used to generate the database schema and types
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations:{
    table: "__drizzle_migrations",
    schema: "public",
  },
  verbose: true,
  strict: true,
});
