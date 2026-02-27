import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common"

import { LocalAuthenticatedRequest } from "./interfaces/local-authenticated-request.interface"
import { JwtAuthenticatedUser } from "./interfaces/jwt-authenticated-request.interface"
import { JwtRefreshTokenAuthGuard } from "./guards/jwt-refresh-token.guard"
import { SignUpWithSupabaseDto } from "./dto/signup-with-supabase.dto"
import { SignInWithSupabaseDto } from "./dto/signin-with-supabase.dto"
import { InjectUser } from "./decorators/inject-user.decorator"
import { ForgotPasswordDto } from "./dto/forgot-password.dto"
import { ResetPasswordDto } from "./dto/reset-password.dto"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import { RefreshTokenDto } from "./dto/refresh-token.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { SignUpDto } from "./dto/sign-up.dto"
import { AuthService } from "./auth.service"

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("sign-in")
    @UseGuards(LocalAuthGuard)
    async signIn(@Req() req: LocalAuthenticatedRequest) {
        return await this.authService.signIn(req.user)
    }

    @Post("sign-in/supabase")
    async signInWithSupabase(@Body() singInWithSupabaseDto: SignInWithSupabaseDto) {
        return await this.authService.signInWithSupabase(singInWithSupabaseDto)
    }

    @Post("sign-up")
    async signUp(@Body() signUpDto: SignUpDto) {
        return await this.authService.signUp(signUpDto)
    }

    @Post("sign-up/supabase")
    async signUpWithSupabase(@Body() singUpWithSupabaseDto: SignUpWithSupabaseDto) {
        return await this.authService.signUpWithSupabase(singUpWithSupabaseDto)
    }

    @Post("refresh-token")
    @UseGuards(JwtRefreshTokenAuthGuard)
    async refreshToken(@InjectUser("id") userId: string, @Body() refreshTokenDto: RefreshTokenDto) {
        return await this.authService.refreshToken(userId, refreshTokenDto)
    }

    @Post("forgot-password")
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return await this.authService.forgotPassword(forgotPasswordDto)
    }

    @Post("reset-password")
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return await this.authService.resetPassword(resetPasswordDto)
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    async getMe(@InjectUser() user: JwtAuthenticatedUser) {
        return user
    }
}
