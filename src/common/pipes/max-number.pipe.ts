import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common"

@Injectable()
export class MaxValueValidationPipe implements PipeTransform<number, number> {
    constructor(private readonly max: number) {}

    transform(value: number, metadata: ArgumentMetadata): number {
        const propertyName = metadata.data || "value"

        if (value > this.max) {
            throw new BadRequestException(
                `Property "${propertyName}" has value ${value} which exceeds the max allowed value of ${this.max}`,
            )
        }

        return value
    }
}
