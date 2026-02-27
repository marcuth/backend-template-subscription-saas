import { createClient } from "@supabase/supabase-js"
import { ConfigService } from "@nestjs/config"

import { SUPABASE_CLIENT_KEY } from "./inject-supabase-client.decorator"

export const SupabaseClientProvider = {
    provide: SUPABASE_CLIENT_KEY,
    useFactory: (configService: ConfigService) => {
        const supabaseUrl = configService.getOrThrow<string>("SUPABASE_URL")
        const supabaseKey = configService.getOrThrow<string>("SUPABASE_KEY")

        return createClient(supabaseUrl, supabaseKey)
    },
    inject: [ConfigService],
}
