PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_article_location_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleId` text NOT NULL,
	`locationName` text NOT NULL,
	`locationaddress` text,
	`locationLatitude` real,
	`locationLongitude` real,
	`locationID` integer,
	`projectName` text NOT NULL,
	`projectDescription` text,
	`projectId` integer,
	`fromTs` integer DEFAULT (unixepoch()) NOT NULL,
	`toTs` integer,
	FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`locationID`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_article_location_history`("id", "articleId", "locationName", "locationaddress", "locationLatitude", "locationLongitude", "locationID", "projectName", "projectDescription", "projectId", "fromTs", "toTs") SELECT "id", "articleId", "locationName", "locationaddress", "locationLatitude", "locationLongitude", "locationID", "projectName", "projectDescription", "projectId", "fromTs", "toTs" FROM `article_location_history`;--> statement-breakpoint
DROP TABLE `article_location_history`;--> statement-breakpoint
ALTER TABLE `__new_article_location_history` RENAME TO `article_location_history`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_articles` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`ampacity` integer NOT NULL,
	`connector` text,
	`outputs` text,
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
CREATE UNIQUE INDEX `locations_address_unique` ON `locations` (`address`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_name_unique` ON `projects` (`name`);