import { Query, ParseIntPipe, DefaultValuePipe } from "@nestjs/common"

import { MinValueValidationPipe } from "../pipes/min-number.pipe"
import { MaxValueValidationPipe } from "../pipes/max-number.pipe"
import { configHelper } from "../../helpers/config.helper"

export function PerPage() {
    return Query(
        "perPage",
        new DefaultValuePipe(configHelper.pagination.defaultPerPage),
        ParseIntPipe,
        new MinValueValidationPipe(configHelper.pagination.minPerPage),
        new MaxValueValidationPipe(configHelper.pagination.maxPerPage),
    )
}
