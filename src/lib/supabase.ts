"server only";

import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SECRET_KEY;

if(!url || !key) {
        throw new Error("Missing Supabase environment variables");
    }

export const supabaseAdmin = createClient(url, key);