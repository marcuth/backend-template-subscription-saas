import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger"
import { NestFactory } from "@nestjs/core"
import helmet from "helmet"

import { configHelper } from "./helpers/config.helper"
import { AppModule } from "./app.module"

async function createSwaggerSpec(document: OpenAPIObject) {
    const fs = await import("fs")

    document.servers = [
        {
            url: `http://localhost:${configHelper.app.port}`,
            description: "Dev",
        },
    ]

    await fs.promises.writeFile("./swagger-spec.json", JSON.stringify(document))
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { rawBody: true })

    app.use(helmet())
    app.enableCors(configHelper.app.cors)
    app.useGlobalPipes(configHelper.app.validationPipe)

    if (configHelper.isDevelopment) {
        const config = new DocumentBuilder()
            .setTitle(`${configHelper.app.metadata.name} - API Documentation`)
            .setVersion(configHelper.app.metadata.version)
            .addBearerAuth()
            .build()

        const document = SwaggerModule.createDocument(app, config)

        await createSwaggerSpec(document)

        SwaggerModule.setup("docs", app, document)
    }

    await app.listen(configHelper.app.port)
}

bootstrap()
