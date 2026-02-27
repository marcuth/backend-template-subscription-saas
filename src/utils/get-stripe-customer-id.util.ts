import Stripe from "stripe"

export function getStripeCustomerId(subscription: Stripe.Subscription) {
    const customer = subscription.customer
    const customerId = typeof customer === "string" ? customer : customer.id
    return customerId
}
