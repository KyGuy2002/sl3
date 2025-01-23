type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

type D1Database = import("@cloudflare/workers-types").D1Database;

type ENV = {
	// Must run `wramgler types` to apply these changes
	DB: D1Database;
};

declare namespace App {
	interface Locals extends Runtime {}
}
