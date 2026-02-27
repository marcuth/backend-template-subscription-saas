import { User } from "../../generated/prisma/client"
import { Request } from "express"

export type LocalAuthenticatedUser = User

export interface LocalAuthenticatedRequest extends Request {
    user: LocalAuthenticatedUser
}
