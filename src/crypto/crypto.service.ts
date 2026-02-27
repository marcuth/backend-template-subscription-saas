import { ConfigService } from "@nestjs/config"
import { Injectable } from "@nestjs/common"
import * as bcrypt from "bcrypt"

import * as crypto from "node:crypto"

@Injectable()
export class CryptoService {
    private readonly algorithm: string
    private readonly key: Buffer
    private readonly iv: Buffer

    constructor(private readonly configService: ConfigService) {
        this.algorithm = configService.getOrThrow<string>("ENCRYPTION_ALGORITHM")
        this.key = Buffer.from(configService.getOrThrow<string>("ENCRYPTION_KEY"), "hex")
        this.iv = Buffer.from(configService.getOrThrow<string>("ENCRYPTION_IV"), "hex")
    }

    encrypt(text: string): string {
        const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv)
        let encrypted = cipher.update(text, "utf8", "hex")
        encrypted += cipher.final("hex")
        return encrypted
    }

    decrypt(encryptedText: string): string {
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv)
        let decrypted = decipher.update(encryptedText, "hex", "utf8")
        decrypted += decipher.final("utf8")
        return decrypted
    }

    async hashPassword(password: string) {
        const saltRoundString = this.configService.getOrThrow<string>("BCRYPT_SALT_ROUNDS")
        const saltRounds = Number(saltRoundString)
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        return hashedPassword
    }

    async comparePasswords(plainPassword: string, hashedPassword: string) {
        return bcrypt.compare(plainPassword, hashedPassword)
    }
}
