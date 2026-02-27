import { Injectable, NotFoundException } from "@nestjs/common"

import { UpdateSubscriptionDto } from "./dto/update-subscription.dto"
import { messagesHelper } from "../helpers/messages.helper"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class SubscriptionsService {
    constructor(private readonly prisma: PrismaService) {}

    async updateByUserId(userId: string, updateSubscriptionDto: UpdateSubscriptionDto) {
        const existingSubscription = await this.prisma.subscription.findUnique({
            where: {
                userId: userId,
            },
            select: {
                id: true,
            },
        })

        if (!existingSubscription) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "Subscription",
                    property: "userId",
                    value: userId,
                }),
            )
        }

        return await this.prisma.subscription.update({
            where: {
                id: userId,
            },
            data: updateSubscriptionDto,
        })
    }
}
