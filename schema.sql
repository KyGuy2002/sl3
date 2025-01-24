PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_passkey_challenges` (
	`challenge` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_passkey_challenges`("challenge", "expires") SELECT "challenge", "expires" FROM `passkey_challenges`;--> statement-breakpoint
DROP TABLE `passkey_challenges`;--> statement-breakpoint
ALTER TABLE `__new_passkey_challenges` RENAME TO `passkey_challenges`;--> statement-breakpoint
PRAGMA foreign_keys=ON;