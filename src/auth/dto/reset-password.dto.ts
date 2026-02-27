import { IsJWT, Matches } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

import { regexHelper } from "../../helpers/regex.helper"

export class ResetPasswordDto {
    @ApiProperty()
    @IsJWT()
    token: string

    @ApiProperty()
    @Matches(regexHelper.password)
    password: string
}
