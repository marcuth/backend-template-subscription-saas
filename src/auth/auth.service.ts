import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common"
import { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"

import type { StringValue } from "ms"

import { JwtAccessPayload, JwtForgotPasswordPayload, JwtRefreshPayload } from "./interfaces/jwt-payload.interface"
import { InjectSupabaseClient } from "../supabase/inject-supabase-client.decorator"
import { SignUpWithSupabaseDto } from "./dto/signup-with-supabase.dto"
import { SignInWithSupabaseDto } from "./dto/signin-with-supabase.dto"
import { UserWithoutSensitiveInfo } from "../users/users.types"
import { generateUsername } from "../utils/generate-username"
import { ForgotPasswordDto } from "./dto/forgot-password.dto"
import { messagesHelper } from "../helpers/messages.helper"
import { ResetPasswordDto } from "./dto/reset-password.dto"
import { RefreshTokenDto } from "./dto/refresh-token.dto"
import { MailerService } from "../mailer/mailer.service"
import { configHelper } from "../helpers/config.helper"
import { UsersService } from "../users/users.service"
import { User } from "../generated/prisma/client"
import { SignUpDto } from "./dto/sign-up.dto"

@Injectable()
export class AuthService {
    private readonly refreshSignExpiresIn: StringValue

    constructor(
        @InjectSupabaseClient() private readonly supabase: SupabaseClient,
        private readonly mailerService: MailerService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.refreshSignExpiresIn = configService.getOrThrow<StringValue>("REFRESH_SIGN_EXPIRES_IN")
    }

    async signIn(user: User) {
        const accessPayload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            name: user.name,
            type: "access",
        } satisfies JwtAccessPayload

        const refreshPayload = {
            sub: user.id,
            type: "refresh",
        } satisfies JwtRefreshPayload

        return {
            accessToken: this.jwtService.sign(accessPayload),
            refreshToken: this.jwtService.sign(refreshPayload, {
                expiresIn: this.refreshSignExpiresIn,
            }),
        }
    }

    async signUp(signUpDto: SignUpDto) {
        const planId = signUpDto.planId || configHelper.plans.free.id

        if (planId === configHelper.plans.admin.id) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "Plan",
                    property: "id",
                    value: planId,
                }),
            )
        }

        return await this.usersService.create({ ...signUpDto, planId: planId })
    }

    async signInWithSupabase(loginWithSupabaseDto: SignInWithSupabaseDto) {
        const { id: supabaseId, email } = await this.verifySupabaseToken(loginWithSupabaseDto.token)

        const foundUserBySubaseId = await this.usersService.safeFindOneBySupabaseId(supabaseId)
        const foundUserByEmail = email ? await this.usersService.safeFindOneByEmail(email) : null

        const user = foundUserBySubaseId || foundUserByEmail

        if (!user) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "User",
                    property: "supabaseId",
                    value: supabaseId,
                }),
            )
        }

        const accessPayload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            name: user.name,
            type: "access",
        } satisfies JwtAccessPayload

        const refreshPayload = {
            sub: user.id,
            type: "refresh",
        } satisfies JwtRefreshPayload

        return {
            accessToken: this.jwtService.sign(accessPayload),
            refreshToken: this.jwtService.sign(refreshPayload, {
                expiresIn: this.refreshSignExpiresIn,
            }),
        }
    }

    private async checkIfUserExistsForSupabaseSignUp(supabaseId: string, email: string): Promise<void> {
        const foundUserBySubaseId = await this.usersService.safeFindOneBySupabaseId(supabaseId)
        const foundUserByEmail = await this.usersService.safeFindOneByEmail(email)
        const existingUser = foundUserBySubaseId || foundUserByEmail

        if (existingUser) {
            throw new BadRequestException(messagesHelper.OAUTH_ACCOUNT_ALREADY_EXISTS)
        }
    }

    async signUpWithSupabase(signUpWithSupabaseDto: SignUpWithSupabaseDto) {
        const {
            id: supabaseId,
            email,
            user_metadata: metadata,
        } = await this.verifySupabaseToken(signUpWithSupabaseDto.token)

        if (!email) {
            throw new BadRequestException(messagesHelper.OAUTH_ACCOUNT_WITHOUT_EMAIL)
        }

        await this.checkIfUserExistsForSupabaseSignUp(supabaseId, email)

        const userName = metadata?.name ?? signUpWithSupabaseDto.name ?? "Unknown User"
        const generatedUsernasme = generateUsername(userName)

        if (signUpWithSupabaseDto.planId === configHelper.plans.admin.id) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "Plan",
                    property: "id",
                    value: signUpWithSupabaseDto.planId,
                }),
            )
        }

        const planId = signUpWithSupabaseDto.planId || configHelper.plans.free.id

        return await this.usersService.create({
            email: email,
            name: userName,
            supabaseId: supabaseId,
            planId: planId,
            username: generatedUsernasme,
        })
    }

    async refreshToken(userId: string, { refreshToken }: RefreshTokenDto) {
        let payload: JwtRefreshPayload

        try {
            payload = this.jwtService.verify<JwtRefreshPayload>(refreshToken, {
                secret: this.configService.getOrThrow<string>("JWT_PRIVATE_KEY"),
            })
        } catch (error) {
            throw new UnauthorizedException(messagesHelper.INVALID_AUTHORIZATION_TOKEN)
        }

        if (payload.sub !== userId) {
            throw new UnauthorizedException(messagesHelper.INVALID_AUTHORIZATION_TOKEN)
        }

        const user = await this.usersService.findOne(payload.sub)

        const accessPayload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            name: user.name,
            type: "access",
        } satisfies JwtAccessPayload

        const newRefreshPayload = {
            sub: user.id,
            type: "refresh",
        } satisfies JwtRefreshPayload

        return {
            accessToken: this.jwtService.sign(accessPayload),
            refreshToken: this.jwtService.sign(newRefreshPayload, {
                expiresIn: this.refreshSignExpiresIn,
            }),
        }
    }

    async forgotPassword({ email }: ForgotPasswordDto) {
        const user = await this.usersService.safeFindOneByEmail(email)

        if (!user) return

        const payload = {
            sub: email,
            type: "forgot_password",
        } satisfies JwtForgotPasswordPayload

        const token = this.jwtService.sign(payload, {
            expiresIn: "1h",
        })

        await this.mailerService.send({
            to: payload.sub,
            subject: "Your password has been reset",
            senderEmail: this.configService.getOrThrow<string>("BREVO_SENDER_EMAIL"),
            htmlContent: `<p>Click <a href="#/reset-password?token=${token}">here</a> to reset your password.</p>`,
        })
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const payload = this.jwtService.verify<JwtForgotPasswordPayload>(resetPasswordDto.token)
        await this.usersService.resetPassword(payload.sub, resetPasswordDto.password)
    }

    async validateUser(email: string, password: string): Promise<UserWithoutSensitiveInfo | null> {
        let user: User

        try {
            user = await this.usersService.findOneByEmail(email)
        } catch (error) {
            return null
        }

        if (!user.password) {
            throw new BadRequestException(messagesHelper.OAUTH_ACCOUNT_WITHOUT_PASSWORD)
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {
            return null
        }

        const { password: _, ...rest } = user

        return rest
    }

    async verifySupabaseToken(token: string): Promise<SupabaseUser> {
        const { data, error } = await this.supabase.auth.getUser(token)

        if (error || !data.user) {
            throw new UnauthorizedException(messagesHelper.INVALID_SUPABASE_AUTH_TOKEN)
        }

        return data.user
    }

    async validateApiKey(apiKey: string) {
        const user = await this.usersService.findOneByApiKey(apiKey)

        if (!user) {
            return null
        }

        return user
    }
}
