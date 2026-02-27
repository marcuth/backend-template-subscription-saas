import { UserRole } from "../../generated/prisma/enums"
import { Request } from "express"

export interface ApiKeyAuthenticatedUser {
    id: string
    email: string
    role: UserRole
    featureUsage: {
        monthly_ai_chat_messages: number
    }
    planId: string
}

export interface ApiKeyAuthenticatedRequest extends Request {
    user: ApiKeyAuthenticatedUser
}
