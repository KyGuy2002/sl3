CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`createdAt` integer NOT NULL,
	`passkeyChallenge` text
);
--> statement-breakpoint
CREATE TABLE `passkeys` (
	`id` text NOT NULL,
	`credId` text PRIMARY KEY NOT NULL,
	`credPublicKey` blob NOT NULL,
	`transports` text NOT NULL,
	`counter` integer NOT NULL,
	`deviceType` text NOT NULL,
	`backedUp` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`lastUsed` integer,
	FOREIGN KEY (`id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
