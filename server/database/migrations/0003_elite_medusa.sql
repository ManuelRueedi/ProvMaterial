PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleIdentifier` text,
	`type` text NOT NULL,
	`ampacity` text NOT NULL,
	`connector` text,
	`outputs` text,
	`tags` text,
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
INSERT INTO `__new_articles`("id", "articleIdentifier", "type", "ampacity", "connector", "outputs", "tags", "lengthInMeter", "locationId", "storageLocationId", "storageLocationSection", "currentProjectId", "createdAt", "updatedAt") SELECT "id", "articleIdentifier", "type", "ampacity", "connector", "outputs", "tags", "lengthInMeter", "locationId", "storageLocationId", "storageLocationSection", "currentProjectId", "createdAt", "updatedAt" FROM `articles`;--> statement-breakpoint
DROP TABLE `articles`;--> statement-breakpoint
ALTER TABLE `__new_articles` RENAME TO `articles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;