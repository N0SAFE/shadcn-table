import { sqliteTable } from "@/db/utils"
import { sql } from "drizzle-orm"
import {
  integer,
  text,
} from "drizzle-orm/sqlite-core"

import { generateId } from "@/lib/id"

export const tasks = sqliteTable("tasks", {
  id: text("id", { length: 30 })
    .$defaultFn(() => generateId())
    .primaryKey(),
  code: text("code", { length: 128 }).notNull().unique(),
  title: text("title", { length: 128 }),
  status: text("status", {
    length: 30,
    enum: ["todo", "in-progress", "done", "canceled"],
  })
    .notNull()
    .default("todo"),
  label: text("label", {
    length: 30,
    enum: ["bug", "feature", "enhancement", "documentation"],
  })
    .notNull()
    .default("bug"),
  priority: text("priority", {
    length: 30,
    enum: ["low", "medium", "high"],
  })
    .notNull()
    .default("low"),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .defaultNow()
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
