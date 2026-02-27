import { User } from "../generated/prisma/client"

export type UserWithoutSensitiveInfo = Omit<User, "password" | "apiKey">

export type UserWithoutPassword = Omit<User, "password">
