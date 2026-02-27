import { Query, ParseIntPipe, DefaultValuePipe } from "@nestjs/common"

import { MinValueValidationPipe } from "../pipes/min-number.pipe"
import { configHelper } from "../../helpers/config.helper"

export function Page(): ParameterDecorator {
    return Query(
        "page",
        new DefaultValuePipe(configHelper.pagination.defaultPage),
        ParseIntPipe,
        new MinValueValidationPipe(configHelper.pagination.minPage),
    )
}
