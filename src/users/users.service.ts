import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import { createPaginator, PaginateOptions } from "prisma-pagination"
import { InjectStripeClient } from "@golevelup/nestjs-stripe"
import { ConfigService } from "@nestjs/config"
import Stripe from "stripe"

import { getCurrentSubscriptionPeriods } from "../utils/get-stripe-current-subscription-periods.util"
import { getStripeSubscriptionItemId } from "../utils/get-stripe-subscription-item-id.util"
import { DiscordWebhookService } from "../discord-webhook/discord-webhook.service"
import { messagesHelper } from "../helpers/messages.helper"
import { generateApiKey } from "../utils/generate-api-key"
import { Prisma, User } from "../generated/prisma/client"
import { PrismaService } from "../prisma/prisma.service"
import { MailerService } from "../mailer/mailer.service"
import { CryptoService } from "../crypto/crypto.service"
import { UserWithoutSensitiveInfo } from "./users.types"
import { configHelper } from "../helpers/config.helper"
import { UpdateUserDto } from "./dto/update-user.dto"
import { CreateUserDto } from "./dto/create-user.dto"

type StripeCustomerAndSubscription = {
    customer: Stripe.Customer
    subscription: Stripe.Subscription
}

@Injectable()
export class UsersService {
    constructor(
        private readonly discordWebhookService: DiscordWebhookService,
        @InjectStripeClient() private readonly stripe: Stripe,
        private readonly cryptoService: CryptoService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {}

    private async validateNewUser(email: string, username: string): Promise<void> {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: email,
                username: username,
            },
            select: {
                email: true,
                username: true,
            },
        })

        if (existingUser) {
            const property = email === existingUser.email ? "email" : "username"
            const value = property === "email" ? email : username

            throw new ConflictException(
                messagesHelper.OBJECT_ALREADY_EXISTS({
                    name: "User",
                    property: property,
                    value: value,
                }),
            )
        }
    }

    private async handleStripeCustomerAndSubscription(
        createUserDto: CreateUserDto,
        externalPriceId: string,
    ): Promise<StripeCustomerAndSubscription> {
        const existingCustomers = await this.stripe.customers.list({
            email: createUserDto.email,
            limit: 1,
        })

        let customer: Stripe.Customer

        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0]
        } else {
            customer = await this.stripe.customers.create({
                email: createUserDto.email,
                name: createUserDto.name,
                metadata: {
                    ...(createUserDto.planId && { planId: createUserDto.planId }),
                    ...(createUserDto.supabaseId && { supabaseId: createUserDto.supabaseId }),
                },
            })
        }

        const subscription = await this.stripe.subscriptions.create({
            customer: customer.id,
            items: [
                {
                    price: externalPriceId,
                },
            ],
        })

        return { customer, subscription }
    }

    private async sendWelcomeNotifications(user: UserWithoutSensitiveInfo): Promise<void> {
        this.discordWebhookService.safeNotify({
            nameSuffix: "Created",
            type: "success",
            title: "Usuário criado",
            message: `Id do usuário: ${user.id}\nEmail: ${user.email}\n\`\`\`json\n${JSON.stringify({ user: user }, null, 4)}\`\`\``,
        })

        this.mailerService.send({
            senderName: `${configHelper.app.metadata.name} - Conta criada!`,
            subject: `Bem vindo ao ${configHelper.app.metadata.name}`,
            to: user.email,
            senderEmail: this.configService.getOrThrow<string>("BREVO_SENDER_EMAIL"),
            htmlContent: `<h1>Seja bem vindo(a) ao ${configHelper.app.metadata.name}!</h1>`,
        })
    }

    async create(createUserDto: CreateUserDto) {
        const { password, ...rest } = createUserDto

        await this.validateNewUser(createUserDto.email, createUserDto.username)

        const { customer, subscription } = await this.handleStripeCustomerAndSubscription(
            createUserDto,
            configHelper.plans.free.id,
        )

        const subscriptionItemId = getStripeSubscriptionItemId(subscription)
        const { currentPeriodEnd, currentPeriodStart } = getCurrentSubscriptionPeriods(subscription)

        const generatedApiKey = generateApiKey()
        const encryptedApiKey = this.cryptoService.encrypt(generatedApiKey)
        const hashedPassword = password ? await this.cryptoService.hashPassword(password) : null

        const user = await this.prisma.user.create({
            data: {
                ...rest,
                apiKey: encryptedApiKey,
                password: hashedPassword,
                stripeCustomerId: customer.id,
                subscription: {
                    create: {
                        status: subscription.status,
                        externalId: subscription.id,
                        itemId: subscriptionItemId,
                        currentPeriodEnd: currentPeriodEnd,
                        currentPeriodStart: currentPeriodStart,
                        cancelAtPeriodEnd: subscription.cancel_at_period_end,
                        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
                        endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
                    },
                },
                featureUsage: {},
            },
            omit: {
                password: true,
                apiKey: true,
            },
        })

        this.sendWelcomeNotifications(user)

        return {
            ...user,
            apiKey: generatedApiKey,
        }
    }

    async findAll({ page, perPage }: PaginateOptions) {
        const paginate = createPaginator({
            page: page,
            perPage: perPage,
        })

        return await paginate<User, Prisma.UserFindManyArgs>(this.prisma.user, {
            omit: {
                password: true,
                apiKey: true,
            },
        })
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
            omit: {
                password: true,
            },
        })

        if (!user) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "User",
                    value: id,
                }),
            )
        }

        return user
    }

    async findOneByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        })

        if (!user) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "User",
                    property: "email",
                    value: email,
                }),
            )
        }

        return user
    }

    async safeFindOneByEmail(email: string) {
        try {
            return await this.findOneByEmail(email)
        } catch (error) {
            if (error instanceof NotFoundException) {
                return null
            } else {
                throw error
            }
        }
    }

    async findOneByApiKey(apiKey: string) {
        const encryptedApiKey = this.cryptoService.encrypt(apiKey)

        const user = await this.prisma.user.findUnique({
            where: {
                apiKey: encryptedApiKey,
            },
        })

        if (!user) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "User",
                    property: "apiKey",
                    value: apiKey,
                }),
            )
        }

        return user
    }

    async findOneBySupabaseId(supabaseId: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                supabaseId: supabaseId,
            },
        })

        if (!user) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "User",
                    property: "supabaseId",
                    value: supabaseId,
                }),
            )
        }

        return user
    }

    async safeFindOneBySupabaseId(supabaseId: string) {
        try {
            return await this.findOneBySupabaseId(supabaseId)
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                return null
            } else {
                throw error
            }
        }
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
            },
        })

        if (!existingUser) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "User",
                    property: "id",
                    value: id,
                }),
            )
        }

        return await this.prisma.user.update({
            where: {
                id: id,
            },
            data: {
                ...updateUserDto,
            },
        })
    }

    async resetPassword(email: string, password: string) {
        const user = await this.findOneByEmail(email)
        const hashedPassword = await this.cryptoService.hashPassword(password)

        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                password: hashedPassword,
            },
        })
    }

    async remove(id: string) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
            },
        })

        if (!existingUser) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "User",
                    property: "id",
                    value: id,
                }),
            )
        }

        await this.prisma.user.delete({
            where: {
                id: id,
            },
        })
    }
}
