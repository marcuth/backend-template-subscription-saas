import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common"

@Injectable()
export class MinValueValidationPipe implements PipeTransform<number, number> {
    constructor(private readonly min: number) {}

    transform(value: number, metadata: ArgumentMetadata): number {
        const propertyName = metadata.data || "value"

        if (value < this.min) {
            throw new BadRequestException(
                `Property "${propertyName}" has value ${value} which exceeds the min allowed value of ${this.min}`,
            )
        }

        return value
    }
}
