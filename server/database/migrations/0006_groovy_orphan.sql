PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_article_location_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleId` text,
	`locationId` integer,
	`fromTs` integer DEFAULT (unixepoch()) NOT NULL,
	`toTs` integer,
	FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_article_location_history`("id", "articleId", "locationId", "fromTs", "toTs") SELECT "id", "articleId", "locationId", "fromTs", "toTs" FROM `article_location_history`;--> statement-breakpoint
DROP TABLE `article_location_history`;--> statement-breakpoint
ALTER TABLE `__new_article_location_history` RENAME TO `article_location_history`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_articles` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`ampacity` integer NOT NULL,
	`connector` text,
	`outputs` text,
	`tags` text,
	`lengthInMeter` real NOT NULL,
	`locationId` integer NOT NULL,
	`storageLocationId` integer NOT NULL,
	`storageLocationSection` text,
	`currentProjectId` integer,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON UPDATE cascade ON DELETE no action,
	FOREIGN KEY (`storageLocationId`) REFERENCES `locations`(`id`) ON UPDATE cascade ON DELETE no action,
	FOREIGN KEY (`currentProjectId`) REFERENCES `projects`(`id`) ON UPDATE cascade ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_articles`("id", "type", "ampacity", "connector", "outputs", "tags", "lengthInMeter", "locationId", "storageLocationId", "storageLocationSection", "currentProjectId", "createdAt", "updatedAt") SELECT "id", "type", "ampacity", "connector", "outputs", "tags", "lengthInMeter", "locationId", "storageLocationId", "storageLocationSection", "currentProjectId", "createdAt", "updatedAt" FROM `articles`;--> statement-breakpoint
DROP TABLE `articles`;--> statement-breakpoint
ALTER TABLE `__new_articles` RENAME TO `articles`;--> statement-breakpoint
CREATE TABLE `__new_change_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleId` text,
	`changeTs` integer DEFAULT (unixepoch()),
	`user` text,
	`field` text,
	`old` text,
	`new` text,
	FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_change_log`("id", "articleId", "changeTs", "user", "field", "old", "new") SELECT "id", "articleId", "changeTs", "user", "field", "old", "new" FROM `change_log`;--> statement-breakpoint
DROP TABLE `change_log`;--> statement-breakpoint
ALTER TABLE `__new_change_log` RENAME TO `change_log`;