import { Global, Module } from "@nestjs/common"

import { SUPABASE_CLIENT_KEY } from "./inject-supabase-client.decorator"
import { SupabaseClientProvider } from "./supabase.provider"

@Global()
@Module({
    providers: [SupabaseClientProvider],
    exports: [SUPABASE_CLIENT_KEY],
})
export class SupabaseModule {}
