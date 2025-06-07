PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_change_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleId` text,
	`changeTs` integer DEFAULT (unixepoch()),
	`userId` integer,
	`old` text,
	`new` text
);
--> statement-breakpoint
INSERT INTO `__new_change_log`("id", "articleId", "changeTs", "userId", "old", "new") SELECT "id", "articleId", "changeTs", "userId", "old", "new" FROM `change_log`;--> statement-breakpoint
DROP TABLE `change_log`;--> statement-breakpoint
ALTER TABLE `__new_change_log` RENAME TO `change_log`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_articles` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`ampacity` integer NOT NULL,
	`connector` text,
	`outputs` text DEFAULT '{}',
	`tags` text DEFAULT '[]' NOT NULL,
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
CREATE UNIQUE INDEX `locations_name_unique` ON `locations` (`name`);