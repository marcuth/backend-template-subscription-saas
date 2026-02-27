import { StripeModule } from "@golevelup/nestjs-stripe"
import { Global, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Global()
@Module({
    imports: [
        StripeModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                apiKey: configService.getOrThrow<string>("STRIPE_API_KEY"),
                apiVersion: "2025-08-27.basil",
                webhookConfig: {
                    stripeSecrets: {
                        account: configService.getOrThrow<string>("STRIPE_WEBHOOK_SECRET"),
                    },
                    requestBodyProperty: "rawBody",
                },
            }),
            inject: [ConfigService],
        }),
    ],
    exports: [StripeModule],
})
export class StripeGlobalModule {}
