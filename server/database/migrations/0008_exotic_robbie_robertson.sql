DROP INDEX `locations_address_unique`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_article_location_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleId` text NOT NULL,
	`locationName` text NOT NULL,
	`locationaddress` text,
	`locationLatitude` real,
	`locationLongitude` real,
	`locationID` integer,
	`projectName` text,
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
PRAGMA foreign_keys=ON;