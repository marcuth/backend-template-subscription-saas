import { createParamDecorator, ExecutionContext } from "@nestjs/common"

import { JwtAuthenticatedRequest, JwtAuthenticatedUser } from "../interfaces/jwt-authenticated-request.interface"

export const InjectUser = createParamDecorator(
    (data: keyof JwtAuthenticatedUser | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest() as JwtAuthenticatedRequest
        return data ? request.user[data] : request.user
    },
)
