import { Injectable, UnauthorizedException } from "@nestjs/common"
import { HeaderAPIKeyStrategy } from "passport-headerapikey"
import { PassportStrategy } from "@nestjs/passport"

import { messagesHelper } from "../../helpers/messages.helper"
import { AuthService } from "../auth.service"

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, "api-key") {
    constructor(private readonly authService: AuthService) {
        super({ header: "X-API-KEY", prefix: "" }, false)
    }

    async validate(apikey: string, done: (err: Error | null, user?: Object, info?: Object) => void) {
        try {
            const user = await this.authService.validateApiKey(apikey)

            if (!user) {
                return done(new UnauthorizedException(messagesHelper.INVALID_API_KEY), undefined)
            }

            return done(null, user)
        } catch (error) {
            return done(error, undefined)
        }
    }
}
