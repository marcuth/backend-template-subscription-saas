import { applyDecorators } from "@nestjs/common"
import { ApiQuery } from "@nestjs/swagger"

import { configHelper } from "../../helpers/config.helper"

export function ApiPaginated() {
    return applyDecorators(
        ApiQuery({
            name: "page",
            required: false,
            type: Number,
            minimum: configHelper.pagination.minPage,
        }),
        ApiQuery({
            name: "perPage",
            required: false,
            type: Number,
            minimum: configHelper.pagination.minPerPage,
            maximum: configHelper.pagination.maxPerPage,
        }),
    )
}
