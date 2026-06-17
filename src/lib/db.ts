import { Pool } from "pg";

console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
    console.log(
        "DB Host:",
        new URL(process.env.DATABASE_URL).hostname
    );
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});