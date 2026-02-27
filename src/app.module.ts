import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler"
import { ConfigModule } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { Module } from "@nestjs/common"

import { StripeWebhookModule } from "./stripe-webhook/stripe-webhook.module"
import { SubscriptionsModule } from "./subscriptions/subscriptions.module"
import { SupabaseModule } from "./supabase/supabase.module"
import { StripeGlobalModule } from "./stripe-global.module"
import { UsersModule } from "./users/users.module"
import { PlansModule } from "./plans/plans.module"
import { AuthModule } from "./auth/auth.module"

@Module({
    imports: [
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    name: "short",
                    ttl: 1000,
                    limit: 3,
                },
                {
                    name: "long",
                    ttl: 60000,
                    limit: 100,
                },
            ],
        }),
        ConfigModule.forRoot({ isGlobal: true }),
        StripeGlobalModule,
        UsersModule,
        AuthModule,
        StripeWebhookModule,
        PlansModule,
        SubscriptionsModule,
        SupabaseModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
