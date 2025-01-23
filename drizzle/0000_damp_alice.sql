CREATE TABLE `all_tags` (
	`name` text NOT NULL,
	`tooltipDesc` text NOT NULL,
	`mode` text,
	`isMode` integer NOT NULL,
	PRIMARY KEY(`name`, `mode`)
);
--> statement-breakpoint
CREATE TABLE `server_modes` (
	`id` text PRIMARY KEY NOT NULL,
	`mode` text NOT NULL,
	`tags` text NOT NULL,
	`cardDesc` text NOT NULL,
	`fullDesc` text NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `servers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`desc` text NOT NULL,
	`ip` text NOT NULL,
	`onlinePlayers` integer NOT NULL,
	`versionStart` text NOT NULL,
	`versionEnd` text NOT NULL,
	`created` integer NOT NULL,
	`lastUpdated` integer NOT NULL,
	`online` integer NOT NULL
);
