import { Request } from "express"

import { JwtAccessPayload } from "./jwt-payload.interface"

export type JwtAuthenticatedUser = Omit<JwtAccessPayload, "sub" | "type"> & {
    id: string
}

export interface JwtAuthenticatedRequest extends Request {
    user: JwtAuthenticatedUser
}
