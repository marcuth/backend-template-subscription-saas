import { IsEmail, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

import { configHelper } from "../../helpers/config.helper"
import { regexHelper } from "../../helpers/regex.helper"

export class SignUpDto {
    @ApiProperty()
    @IsString()
    @MinLength(configHelper.users.minNameLength)
    @MaxLength(configHelper.users.maxNameLength)
    name: string

    @ApiProperty()
    @IsString()
    @MinLength(configHelper.users.minUsernameLength)
    @MaxLength(configHelper.users.maxUsernameLength)
    username: string

    @ApiProperty()
    @IsEmail()
    @MaxLength(configHelper.users.maxEmailLength)
    email: string

    @ApiProperty()
    @Matches(regexHelper.password)
    password: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    planId?: string
}
