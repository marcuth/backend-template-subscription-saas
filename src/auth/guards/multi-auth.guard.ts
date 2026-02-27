import { AuthGuard } from "@nestjs/passport"
import { Injectable } from "@nestjs/common"

@Injectable()
export class MultiAuthGuard extends AuthGuard(["jwt", "api-key"]) {}
