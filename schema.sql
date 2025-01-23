PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_server_modes` (
	`id` text NOT NULL,
	`mode` text NOT NULL,
	`tags` text NOT NULL,
	`cardDesc` text NOT NULL,
	`fullDesc` text NOT NULL,
	PRIMARY KEY(`id`, `mode`),
	FOREIGN KEY (`id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_server_modes`("id", "mode", "tags", "cardDesc", "fullDesc") SELECT "id", "mode", "tags", "cardDesc", "fullDesc" FROM `server_modes`;--> statement-breakpoint
DROP TABLE `server_modes`;--> statement-breakpoint
ALTER TABLE `__new_server_modes` RENAME TO `server_modes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;