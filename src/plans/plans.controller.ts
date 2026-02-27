import { Controller, Get } from "@nestjs/common"

import { Id } from "../common/decorators/id.decorator"
import { PlansService } from "./plans.service"

@Controller("plans")
export class PlansController {
    constructor(private readonly plansService: PlansService) {}

    @Get()
    async findAll() {
        return await this.plansService.findAll()
    }

    @Get(":id")
    async findOne(@Id() id: string) {
        return await this.plansService.findOne(id)
    }
}
