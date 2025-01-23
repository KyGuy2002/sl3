import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// export default defineConfig({
//   out: './drizzle',
//   schema: './src/db/schema.ts',
//   driver: "durable-sqlite",
//   dialect: "sqlite",
//   dbCredentials: {
//     url: "as"
//   }
// });

export default process.env.CLOUDFLARE_DATABASE_ID
  ? defineConfig({
      dialect: "sqlite",
      driver: "d1-http",
      out: "drizzle",
      schema: "./src/db/schema.ts",
      dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: process.env.CLOUDFLARE_DATABASE_ID,
        token: process.env.CLOUDFLARE_D1_TOKEN!,
      },
    })
  : defineConfig({
      dialect: "sqlite",
      out: "drizzle",
      schema: "./src/db/schema.ts",
      dbCredentials: {
        url: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/733910486fd64261310fd1c34a82a52bc90f96f700ea575de55907f899c065d9.sqlite",
      },
    });