import { Module } from "@nestjs/common"

import { DiscordWebhookModule } from "../discord-webhook/discord-webhook.module"
import { SubscriptionsModule } from "../subscriptions/subscriptions.module"
import { StripeWebhookService } from "./stripe-webhook.service"
import { configHelper } from "../helpers/config.helper"
import { UsersModule } from "../users/users.module"
import { PlansModule } from "../plans/plans.module"

@Module({
    imports: [
        UsersModule,
        DiscordWebhookModule.forFeature({
            name: "Stripe",
            url: configHelper.discordWebhookUrls.stripeWebhook,
        }),
        PlansModule,
        SubscriptionsModule,
    ],
    providers: [StripeWebhookService],
})
export class StripeWebhookModule {}
