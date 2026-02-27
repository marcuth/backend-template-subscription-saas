import { Module } from "@nestjs/common"

import { DiscordWebhookModule } from "../discord-webhook/discord-webhook.module"
import { RESOURCE_SERVICE_KEY } from "../common/guards/ownership.guard"
import { configHelper } from "../helpers/config.helper"
import { PrismaModule } from "../prisma/prisma.module"
import { MailerModule } from "../mailer/mailer.module"
import { CryptoModule } from "../crypto/crypto.module"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"

@Module({
    imports: [
        PrismaModule,
        CryptoModule,
        DiscordWebhookModule.forFeature({
            name: "Users",
            url: configHelper.discordWebhookUrls.users,
        }),
        MailerModule,
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        {
            provide: RESOURCE_SERVICE_KEY,
            useClass: UsersService,
        },
    ],
    exports: [UsersService],
})
export class UsersModule {}
