import { Inject, Injectable, Logger } from "@nestjs/common"
import { Webhook, MessageBuilder } from "webhook-discord"

import { WEBHOOK_URL_KEY, WEBHOOK_NAME_KEY } from "./discord-webhook.module"

export type NotifyOptions = {
    type: "success" | "info" | "warn" | "error" | "critical"
    title: string
    nameSuffix: string
    message: string
}

@Injectable()
export class DiscordWebhookService {
    private readonly logger: Logger
    private readonly webhook: Webhook

    constructor(
        @Inject("WEBHOOK_URL_KEY") private readonly webhookUrl: string,
        @Inject("WEBHOOK_NAME_KEY") private readonly webhookName: string,
    ) {
        this.logger = new Logger(`${DiscordWebhookService.name}: ${webhookName}`)

        if (!this.webhookUrl) {
            throw new Error("Webhook URL is required.")
        }

        this.webhook = new Webhook(this.webhookUrl)
    }

    async notify({ type, nameSuffix, title, message }: NotifyOptions) {
        const msgBuilder = new MessageBuilder()
            .setTitle(title)
            .setName(`${this.webhookName} - ${nameSuffix}`)
            .setColor(this.getColor(type))
            .setDescription(message)

        await this.webhook.send(msgBuilder)

        this.logger.log(`Sended Message: ${type} - ${title}`)
    }

    async safeNotify(options: NotifyOptions) {
        try {
            await this.notify(options)
        } catch (error) {
            this.logger.warn(`Failed to send notification to Discord (${options.title}): ${error.message}`)
        }
    }

    private getColor(type: string): string {
        switch (type) {
            case "success":
                return "#198754"

            case "info":
                return "#0d6efd"

            case "warn":
                return "#ffc107"

            case "error":
                return "#dc3545"

            case "critical":
                return "#ff0000"

            default:
                return "#ccc"
        }
    }
}
