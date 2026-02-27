import { UserRole } from "../../generated/prisma/enums"

export interface JwtAccessPayload {
    sub: string
    email: string
    role: UserRole
    username: string
    name: string
    type: "access"
}

export interface JwtRefreshPayload {
    sub: string
    type: "refresh"
}

export interface JwtForgotPasswordPayload {
    sub: string
    type: "forgot_password"
}
