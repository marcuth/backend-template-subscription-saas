import { SetMetadata } from "@nestjs/common"

import { UserRole } from "../../generated/prisma/enums"

export const ROLES_KEY = Symbol("ROLES")

export const Roles = (...roles: UserRole[]) => {
    return SetMetadata(ROLES_KEY, roles)
}
