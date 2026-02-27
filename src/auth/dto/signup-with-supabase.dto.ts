import { IsJWT, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

import { configHelper } from "../../helpers/config.helper"

export class SignUpWithSupabaseDto {
    @ApiProperty()
    @IsString()
    @IsJWT()
    token: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MinLength(configHelper.users.minNameLength)
    @MaxLength(configHelper.users.maxNameLength)
    name?: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    planId?: string
}
