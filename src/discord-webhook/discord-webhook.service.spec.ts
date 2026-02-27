import { Test, TestingModule } from "@nestjs/testing"

import { DiscordWebhookService } from "./discord-webhook.service"

describe("DiscordWebhookService", () => {
    let service: DiscordWebhookService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DiscordWebhookService],
        }).compile()

        service = module.get<DiscordWebhookService>(DiscordWebhookService)
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })
})
