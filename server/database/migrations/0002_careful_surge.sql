PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_webauthnCredentials` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`publicKey` text NOT NULL,
	`counter` integer NOT NULL,
	`backedUp` integer NOT NULL,
	`transports` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_webauthnCredentials`("id", "userId", "publicKey", "counter", "backedUp", "transports") SELECT "id", "userId", "publicKey", "counter", "backedUp", "transports" FROM `webauthnCredentials`;--> statement-breakpoint
DROP TABLE `webauthnCredentials`;--> statement-breakpoint
ALTER TABLE `__new_webauthnCredentials` RENAME TO `webauthnCredentials`;--> statement-breakpoint
PRAGMA foreign_keys=ON;