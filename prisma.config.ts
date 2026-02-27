import { defineConfig } from "@prisma/config"
import { env } from "@marcuth/env"
import * as path from "node:path"

export default defineConfig({
    schema: path.join("prisma", "schema.prisma"),
    datasource: {
        url: env("DATABASE_URL")
    },
    migrations: {
        seed: "ts-node ./prisma/seed.ts",
        path: path.join("prisma", "migrations"),
    },
})