import { Inject } from "@nestjs/common"

export const SUPABASE_CLIENT_KEY = Symbol("SUPABASE_CLIENT_KEY")

export const InjectSupabaseClient = () => Inject(SUPABASE_CLIENT_KEY)
