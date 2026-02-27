import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { env } from "@marcuth/env"
import * as bcrypt from "bcrypt"

import * as crypto from "node:crypto"

import { Prisma, PrismaClient } from "../src/generated/prisma/client"
import { configHelper } from "../src/helpers/config.helper"

const adapter = new PrismaBetterSqlite3({ url: env("DATABASE_URL") })
const prisma = new PrismaClient({ adapter: adapter })

const currencyCode = "BRL"

function encryptApiKey(apiKey: string): string {
    const encryptionAlgorithm = env("ENCRYPTION_ALGORITHM")
    const encryptionKey = Buffer.from(env("ENCRYPTION_KEY"), "hex")
    const encryptionIv = Buffer.from(env("ENCRYPTION_IV"), "hex")
    const cipher = crypto.createCipheriv(encryptionAlgorithm, encryptionKey, encryptionIv)
    return `${cipher.update(apiKey, "utf8", "hex")}${cipher.final("hex")}`
}

const adminData = {
    username: env("ADMIN_DEFAULT_USERNAME"),
    email: env("ADMIN_DEFAULT_EMAIL"),
    name: env("ADMIN_DEFAULT_NAME"),
    password: env("ADMIN_DEFAULT_PASSWORD"),
    apiKey: env("ADMIN_DEFAULT_API_KEY"),
}

const plans: Prisma.PlanCreateInput[] = [
    {
        id: configHelper.plans.free.id,
        name: "Free Plan",
        slug: "free",
        currencyCode: currencyCode,
        description: "FREE_DESCRIPTION",
        externalProductId: env("FREE_PLAN_STRIPE_PRODUCT_ID"),
        externalPriceId: env("FREE_PLAN_STRIPE_PRICE_ID"),
        price: 0,
        features: {},
    },
    {
        id: configHelper.plans.pro.id,
        name: "Pro Plan",
        slug: "pro",
        currencyCode: currencyCode,
        description: "PRO_DESCRIOPTION",
        externalProductId: env("PRO_PLAN_STRIPE_PRODUCT_ID"),
        externalPriceId: env("PRO_PLAN_STRIPE_PRICE_ID"),
        price: 29,
        features: {},
    },
    {
        id: configHelper.plans.admin.id,
        name: "Admin Plan",
        slug: "admin",
        currencyCode: currencyCode,
        description: "ADMIN_DESCRIPTION",
        externalProductId: "ADMIN_INTERNAL_PRODUCT_ID",
        externalPriceId: "ADMIN_INTERNAL_PRICE_ID",
        price: 0,
        features: {},
    },
]

async function seedPlans() {
    console.log("Starting plans seeding...")

    for (const plan of plans) {
        const existingPlan = await prisma.plan.findUnique({
            where: { id: plan.id },
            select: { id: true },
        })

        if (existingPlan) {
            console.log(`Plan ${plan.id} already exists!`)
            continue
        }

        console.log(`Creating plan ${plan.id}...`)

        await prisma.plan.create({
            data: plan,
        })

        console.log(`Plan ${plan.id} created successfully!`)
    }

    console.log(`Seeded ${plans.length} plans`)
}

async function seedAdminUser() {
    console.log("Checking for existing admin user...")

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminData.email },
        select: { id: true },
    })

    if (existingAdmin) {
        console.log("Admin already exists!")
        return
    }

    console.log("Creating admin user...")

    const hashSalts = parseInt(env("BCRYPT_SALT_ROUNDS"))
    const hashedPassword = await bcrypt.hash(adminData.password, hashSalts)
    const encryptedApiKey = encryptApiKey(adminData.apiKey)

    await prisma.user.create({
        data: {
            name: adminData.name,
            username: adminData.username,
            email: adminData.email,
            role: "ADMIN",
            password: hashedPassword,
            apiKey: encryptedApiKey,
            plan: {
                connect: {
                    id: env("ADMIN_DEFAULT_PLAN_ID"),
                },
            },
            featureUsage: {},
        },
    })

    console.log("Admin created successfully!")
}

async function main() {
    console.log("Starting database seeding...")

    try {
        await seedPlans()
        await seedAdminUser()

        console.log("Database seeding completed successfully")
    } catch (error) {
        console.error("Seeding failed:", error)
        throw error
    } finally {
        console.log("Disconnecting Prisma client...")

        await prisma.$disconnect()

        console.log("Prisma client disconnected")
    }
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
