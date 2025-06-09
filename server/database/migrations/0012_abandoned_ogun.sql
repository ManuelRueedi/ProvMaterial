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
	`takeOutUserId` integer,
	`bringBackUserId` integer,
	`fromTs` integer DEFAULT (unixepoch()) NOT NULL,
	`toTs` integer,
	FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`locationID`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`takeOutUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`bringBackUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_article_location_history`("id", "articleId", "locationName", "locationaddress", "locationLatitude", "locationLongitude", "locationID", "projectName", "projectDescription", "projectId", "takeOutUserId", "bringBackUserId", "fromTs", "toTs") SELECT "id", "articleId", "locationName", "locationaddress", "locationLatitude", "locationLongitude", "locationID", "projectName", "projectDescription", "projectId", "takeOutUserId", "bringBackUserId", "fromTs", "toTs" FROM `article_location_history`;--> statement-breakpoint
DROP TABLE `article_location_history`;--> statement-breakpoint
ALTER TABLE `__new_article_location_history` RENAME TO `article_location_history`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_change_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`articleId` text,
	`action` text DEFAULT 'update' NOT NULL,
	`changeTs` integer DEFAULT (unixepoch()),
	`old` text,
	`new` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_change_log`("id", "userId", "articleId", "action", "changeTs", "old", "new") SELECT "id", "userId", "articleId", "action", "changeTs", "old", "new" FROM `change_log`;--> statement-breakpoint
DROP TABLE `change_log`;--> statement-breakpoint
ALTER TABLE `__new_change_log` RENAME TO `change_log`;--> statement-breakpoint
CREATE TABLE `__new_inspections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleId` text,
	`inspectionDate` integer NOT NULL,
	`inspectedBy` text,
	`fiType` text,
	`fiTripTimeMs` real,
	`fiTripCurrentMA` real,
	`insulationMohm` real,
	`circuits` text,
	`result` text,
	`notes` text,
	FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_inspections`("id", "articleId", "inspectionDate", "inspectedBy", "fiType", "fiTripTimeMs", "fiTripCurrentMA", "insulationMohm", "circuits", "result", "notes") SELECT "id", "articleId", "inspectionDate", "inspectedBy", "fiType", "fiTripTimeMs", "fiTripCurrentMA", "insulationMohm", "circuits", "result", "notes" FROM `inspections`;--> statement-breakpoint
DROP TABLE `inspections`;--> statement-breakpoint
ALTER TABLE `__new_inspections` RENAME TO `inspections`;