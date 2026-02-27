import { InjectStripeClient, StripeWebhookHandler } from "@golevelup/nestjs-stripe"
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common"
import Stripe from "stripe"

import { getCurrentSubscriptionPeriods } from "../utils/get-stripe-current-subscription-periods.util"
import { getStripeSubscriptionPriceId } from "../utils/get-stripe-subscription-price-id.util"
import { DiscordWebhookService } from "../discord-webhook/discord-webhook.service"
import { SubscriptionsService } from "../subscriptions/subscriptions.service"
import { getStripeCustomerId } from "../utils/get-stripe-customer-id.util"
import { messagesHelper } from "../helpers/messages.helper"
import { UsersService } from "../users/users.service"

@Injectable()
export class StripeWebhookService {
    private readonly logger = new Logger(StripeWebhookService.name)

    constructor(
        @InjectStripeClient() private readonly stripe: Stripe,
        private readonly usersService: UsersService,
        private readonly discordWebookService: DiscordWebhookService,
        private readonly subscriptionsService: SubscriptionsService,
    ) {}

    private async getCustomerById(customerId: string) {
        const customer = await this.stripe.customers.retrieve(customerId)

        if (customer.deleted) {
            throw new InternalServerErrorException(messagesHelper.STRIPE_CUSTOMER_DELETED)
        }

        return customer
    }

    @StripeWebhookHandler("customer.subscription.created")
    async handleCreatedSubscription(event: Stripe.CustomerSubscriptionCreatedEvent) {
        const subscription = event.data.object
        const customerId = getStripeCustomerId(subscription)
        const customer = await this.getCustomerById(customerId)

        if (!customer.email) {
            throw new InternalServerErrorException(messagesHelper.STRIPE_CONSUMER_EMAIL_NOT_REGISTERED)
        }

        const { currentPeriodEnd, currentPeriodStart } = getCurrentSubscriptionPeriods(subscription)
        const user = await this.usersService.findOneByEmail(customer.email)

        const priceId = getStripeSubscriptionPriceId(subscription)

        await this.subscriptionsService.updateByUserId(user.id, {
            stripeSubscriptionId: subscription.id,
            stripeSubscriptionStatus: subscription.status,
            stripePriceId: priceId,
            subscriptionCurrentPeriodEnd: currentPeriodEnd,
            subscriptionCurrentPeriodStart: currentPeriodStart,
        })

        this.discordWebookService.safeNotify({
            nameSuffix: "Create",
            type: "success",
            title: `${user.name} atualizou o plano para ${user.name}!`,
            message: `Novo status: ${subscription.status}. \`\`\`json\n${JSON.stringify({ user }, null, 4)}\`\`\``,
        })
    }

    @StripeWebhookHandler("customer.subscription.paused")
    async handlePausedSubscription(event: Stripe.CustomerSubscriptionPausedEvent) {
        const subscription = event.data.object
        const customerId = getStripeCustomerId(subscription)
        const priceId = getStripeSubscriptionPriceId(subscription)
        const { currentPeriodEnd, currentPeriodStart } = getCurrentSubscriptionPeriods(subscription)

        await this.subscriptionsService.updateByUserId(customerId, {
            isActive: false,
            stripeSubscriptionStatus: subscription.status,
            subscriptionCurrentPeriodEnd: currentPeriodStart,
            subscriptionCurrentPeriodStart: currentPeriodEnd,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
        })
    }

    @StripeWebhookHandler("customer.subscription.updated")
    async handleUpdatedSubscription(event: Stripe.CustomerSubscriptionUpdatedEvent) {
        const subscription = event.data.object
        const customerId = getStripeCustomerId(subscription)
        const priceId = getStripeSubscriptionPriceId(subscription)
        const { currentPeriodEnd, currentPeriodStart } = getCurrentSubscriptionPeriods(subscription)

        const user = await this.subscriptionsService.updateByUserId(customerId, {
            isActive: true,
            stripeSubscriptionStatus: subscription.status,
            subscriptionCurrentPeriodEnd: currentPeriodStart,
            subscriptionCurrentPeriodStart: currentPeriodEnd,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
        })

        this.discordWebookService.safeNotify({
            nameSuffix: "Paused",
            type: "warn",
            title: "Assinatura pausada",
            message: `ID do cliente: ${customerId}\nStatus: ${subscription.status}\n\`\`\`json\n${JSON.stringify({ user: user }, null, 4)}\`\`\``,
        })
    }

    @StripeWebhookHandler("checkout.session.expired")
    async handleExpiredCheckoutSession(event: Stripe.CheckoutSessionExpiredEvent) {
        const session = event.data.object

        this.discordWebookService.safeNotify({
            nameSuffix: "Expired",
            type: "error",
            title: `Sessão de checkout expirada`,
            message: `Sessão ID: ${session.id}\nCliente: ${session.customer}\n\`\`\`json\n${JSON.stringify(
                {
                    customer: session.customer,
                },
                null,
                4,
            )}\`\`\``,
        })
    }
}
