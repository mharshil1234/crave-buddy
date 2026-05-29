import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function getCartId() {
    const cookieStore = await cookies();

    let cartId = cookieStore.get("cartID")?.value;

    if (!cartId) {
        cartId = randomUUID();
        cookieStore.set("cartID", cartId, { path: "/", maxAge: 60 * 60 * 24 * 7 }); // Expires in 7 days
    }

    return cartId;
}