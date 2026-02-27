import { InternalServerErrorException } from "@nestjs/common"
import Stripe from "stripe"

import { messagesHelper } from "../helpers/messages.helper"

export function getCurrentSubscriptionPeriods(subscription: Stripe.Subscription) {
    const data = subscription.items.data[0]

    if (!data) {
        throw new InternalServerErrorException(messagesHelper.STRIPE_NO_CURRENT_SUBSCRIPTION_PERIOD_DATA)
    }

    return {
        currentPeriodStart: new Date(data.current_period_start * 1000),
        currentPeriodEnd: new Date(data.current_period_end * 1000),
    }
}
