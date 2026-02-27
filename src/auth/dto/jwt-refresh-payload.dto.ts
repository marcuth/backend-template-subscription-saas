import { IsIn, IsUUID } from "class-validator"

export class JwtRefreshPayloadDto {
    @IsUUID()
    sub: string

    @IsIn(["refresh"])
    type: "refresh"
}
