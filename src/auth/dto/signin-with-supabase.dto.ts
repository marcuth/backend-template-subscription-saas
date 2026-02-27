import { IsJWT, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class SignInWithSupabaseDto {
    @ApiProperty()
    @IsString()
    @IsJWT()
    token: string
}
