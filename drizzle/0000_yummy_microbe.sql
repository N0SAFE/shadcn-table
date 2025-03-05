CREATE TABLE `shadcn_tasks` (
	`id` text(30) PRIMARY KEY NOT NULL,
	`code` text(128) NOT NULL,
	`title` text(128),
	`status` text(30) DEFAULT 'todo' NOT NULL,
	`label` text(30) DEFAULT 'bug' NOT NULL,
	`priority` text(30) DEFAULT 'low' NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shadcn_tasks_code_unique` ON `shadcn_tasks` (`code`);