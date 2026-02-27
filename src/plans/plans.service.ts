import { Injectable, NotFoundException } from "@nestjs/common"

import { messagesHelper } from "../helpers/messages.helper"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class PlansService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return await this.prisma.plan.findMany()
    }

    async findOne(id: string) {
        const plan = await this.prisma.plan.findUnique({
            where: {
                id: id,
            },
        })

        if (!plan) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "Plan",
                    property: "id",
                    value: id,
                }),
            )
        }

        return plan
    }
}
