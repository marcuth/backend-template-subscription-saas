import { Test, TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"

import { CryptoService } from "./crypto.service"

describe("CryptoService", () => {
    let service: CryptoService

    const mockConfigService = {
        getOrThrow: jest.fn((key: string) => {
            if (key === "ENCRYPTION_ALGORITHM") return "aes-256-cbc"
            if (key === "ENCRYPTION_KEY") return "305b4d83eae2e3e00484336539a8ecd29c841a86f1087e5768cf4f09344266f6"
            if (key === "ENCRYPTION_IV") return "18859ed3ccba5ece96c6f7fb3edf3b94"
            if (key === "BCRYPT_SALT_ROUNDS") return "10"
            return null
        }),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CryptoService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile()

        service = module.get<CryptoService>(CryptoService)
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })

    describe("encryption/decryption", () => {
        it("should encrypt and decrypt correctly", () => {
            const text = "hello-world"
            const encrypted = service.encrypt(text)
            const decrypted = service.decrypt(encrypted)

            expect(encrypted).not.toBe(text)
            expect(decrypted).toBe(text)
        })

        it("should produce different encrypted text for different inputs", () => {
            const text1 = "hello"
            const text2 = "world"
            expect(service.encrypt(text1)).not.toBe(service.encrypt(text2))
        })
    })

    describe("password hashing", () => {
        it("should hash and compare passwords correctly", async () => {
            const password = "my-secret-password"
            const hash = await service.hashPassword(password)

            expect(hash).not.toBe(password)
            expect(await service.comparePasswords(password, hash)).toBe(true)
            expect(await service.comparePasswords("wrong-password", hash)).toBe(false)
        })
    })
})
