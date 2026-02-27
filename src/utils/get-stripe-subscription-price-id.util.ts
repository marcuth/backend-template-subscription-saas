import { InternalServerErrorException } from "@nestjs/common"
import Stripe from "stripe"

import { messagesHelper } from "../helpers/messages.helper"

export function getStripeSubscriptionPriceId(subscription: Stripe.Subscription) {
    const priceId = subscription.items.data[0]?.price.id

    if (!priceId) {
        throw new InternalServerErrorException(messagesHelper.STRIPE_PRICE_ID_NOT_FOUND_IN_SUBSCRIPTION)
    }

    return priceId
}
