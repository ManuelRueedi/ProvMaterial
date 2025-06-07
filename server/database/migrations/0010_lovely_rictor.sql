ALTER TABLE `article_location_history` ADD `takeOutUserId` integer REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `article_location_history` ADD `bringBackUserId` integer REFERENCES users(id);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_change_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleId` text,
	`changeTs` integer DEFAULT (unixepoch()),
	`userId` integer,
	`old` text,
	`new` text,
	FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_change_log`("id", "articleId", "changeTs", "userId", "old", "new") SELECT "id", "articleId", "changeTs", "userId", "old", "new" FROM `change_log`;--> statement-breakpoint
DROP TABLE `change_log`;--> statement-breakpoint
ALTER TABLE `__new_change_log` RENAME TO `change_log`;--> statement-breakpoint
PRAGMA foreign_keys=ON;