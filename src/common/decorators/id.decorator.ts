import { Param, ParseUUIDPipe } from "@nestjs/common"

export function Id(): ParameterDecorator {
    return Param("id", ParseUUIDPipe)
}
