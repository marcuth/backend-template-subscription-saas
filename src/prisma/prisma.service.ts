import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
// import { PrismaPg } from "@prisma/adapter-pg"
import { Injectable, OnModuleInit } from "@nestjs/common"
import { env } from "@marcuth/env"

// import { Pool } from "pg"

import { PrismaClient } from "../generated/prisma/client"

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        const url = env("DATABASE_URL")

        // Para SQLite (Padrão)
        const adapter = new PrismaBetterSqlite3({ url })

        // Para PostgreSQL (Descomente abaixo e comente o SQLite acima)
        // const pool = new Pool({ connectionString: url })
        // const adapter = new PrismaPg(pool)

        super({ adapter: adapter })
    }

    async onModuleInit() {
        await this.$connect()
    }
}
