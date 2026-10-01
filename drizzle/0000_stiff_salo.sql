CREATE TABLE `task_completions` (
	`task_id` text NOT NULL,
	`occurrence_date` text NOT NULL,
	`completed_at` integer NOT NULL,
	PRIMARY KEY(`task_id`, `occurrence_date`),
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`start_at` integer,
	`end_at` integer,
	`all_day` integer DEFAULT false NOT NULL,
	`estimate_minutes` integer,
	`recurrence_rule` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
