import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: "sqlite",
  out: "drizzle",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/733910486fd64261310fd1c34a82a52bc90f96f700ea575de55907f899c065d9.sqlite",
  },
});