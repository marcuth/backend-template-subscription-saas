import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import { Injectable } from "@nestjs/common"

import { JwtAccessPayload } from "../interfaces/jwt-payload.interface"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.getOrThrow<string>("JWT_PRIVATE_KEY"),
        })
    }

    validate(payload: JwtAccessPayload) {
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        }
    }
}
