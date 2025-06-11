CREATE TABLE `article_location_history` (
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
CREATE TABLE `articles` (
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
CREATE TABLE `change_log` (
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
CREATE TABLE `inspections` (
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
CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`latitude` real,
	`longitude` real,
	`isStorageLocation` integer DEFAULT false
);
--> statement-breakpoint
CREATE UNIQUE INDEX `locations_name_unique` ON `locations` (`name`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_name_unique` ON `projects` (`name`);--> statement-breakpoint
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
	`userId` integer NOT NULL,
	`publicKey` text NOT NULL,
	`counter` integer NOT NULL,
	`backedUp` integer NOT NULL,
	`transports` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
