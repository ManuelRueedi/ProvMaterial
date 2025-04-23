ALTER TABLE `change_log` RENAME COLUMN "logId" TO "id";--> statement-breakpoint
ALTER TABLE `inspections` RENAME COLUMN "inspectionId" TO "id";--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`microsoftID` text NOT NULL,
	`mail` text NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text,
	`jobtitle` text,
	`rights` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_mail_unique` ON `users` (`mail`);--> statement-breakpoint
CREATE TABLE `webauthnCredentials` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer,
	`publicKey` text NOT NULL,
	`counter` integer NOT NULL,
	`backedUp` integer NOT NULL,
	`transports` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
