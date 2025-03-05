// import { env } from "@/env.js"
import { type Config } from "drizzle-kit"

import { databasePrefix } from "@/lib/constants"

export default {
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  out: "./drizzle",
  dbCredentials: {
    url: './db.sqlite3',
  },
  tablesFilter: [`${databasePrefix}_*`],
} satisfies Config
