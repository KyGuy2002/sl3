type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

type D1Database = import("@cloudflare/workers-types").D1Database;
type Ai = import("@cloudflare/workers-types").Ai;
type Vectorize = import("@cloudflare/workers-types").Vectorize;

type ENV = {
	// Must run `wrangler types` to apply these changes
	DB: D1Database;
	AI: Ai,
	VECTOR: Vectorize,
};

declare namespace App {
	interface Locals extends Runtime {}
}
