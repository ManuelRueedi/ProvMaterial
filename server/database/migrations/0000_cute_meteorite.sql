CREATE TABLE `article_location_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleId` text,
	`locationId` integer,
	`fromTs` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`toTs` integer,
	FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleIdentifier` text,
	`type` text NOT NULL,
	`connector` text NOT NULL,
	`outputs` text,
	`lengthInMeter` real,
	`locationId` integer,
	`storageLocationId` integer,
	`storageLocationSection` integer,
	`currentProjectId` integer,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON UPDATE cascade ON DELETE no action,
	FOREIGN KEY (`storageLocationId`) REFERENCES `locations`(`id`) ON UPDATE cascade ON DELETE no action,
	FOREIGN KEY (`currentProjectId`) REFERENCES `projects`(`id`) ON UPDATE cascade ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `change_log` (
	`logId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleId` text,
	`changeTs` integer DEFAULT CURRENT_TIMESTAMP,
	`user` text,
	`field` text,
	`old` text,
	`new` text,
	FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `inspections` (
	`inspectionId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
	FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`latitude` real,
	`longitude` real,
	`isStorageLocation` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text
);
