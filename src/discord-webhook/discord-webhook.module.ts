import { DynamicModule, Module } from "@nestjs/common"

import { DiscordWebhookService } from "./discord-webhook.service"

export const WEBHOOK_NAME_KEY = Symbol("WEBHOOK_NAME")
export const WEBHOOK_URL_KEY = Symbol("WEBHOOK_URL")

export type DiscordWebhookOptions = {
    name: string
    url: string
}

@Module({
    providers: [DiscordWebhookService],
})
export class DiscordWebhookModule {
    static forFeature({ name, url }: DiscordWebhookOptions): DynamicModule {
        return {
            module: DiscordWebhookModule,
            providers: [
                {
                    provide: "WEBHOOK_NAME_KEY",
                    useValue: name,
                },
                {
                    provide: "WEBHOOK_URL_KEY",
                    useValue: url,
                },
                DiscordWebhookService,
            ],
            exports: [DiscordWebhookService],
        }
    }
}
