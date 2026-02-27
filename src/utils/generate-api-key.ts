import * as crypto from "node:crypto"

import { configHelper } from "../helpers/config.helper"

export function generateApiKey() {
    const randomChars = crypto.randomBytes(configHelper.users.apiKey.randomCharsLength / 2).toString("hex")
    const apiKey = configHelper.users.apiKey.prefix + randomChars
    return apiKey
}
