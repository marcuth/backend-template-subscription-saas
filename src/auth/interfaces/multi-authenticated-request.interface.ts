import { Request } from "express"

import { ApiKeyAuthenticatedUser } from "./api-key-authenticated-request.interface"
import { JwtAuthenticatedUser } from "./jwt-authenticated-request.interface"

export type MultiAuthenticatedUser = JwtAuthenticatedUser | ApiKeyAuthenticatedUser

export interface MultiAuthenticatedRequest extends Request {
    user: MultiAuthenticatedUser
}
