import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { redis } from "@/lib/redis";
import { getMenuItem, getRestaurantsByIds, restaurantImageUrl } from "@/lib/catalogue";
import { MAX_ITEM_QUANTITY } from "@/lib/cart-limits";

/**
 * The cart is a Redis hash at `cart:v2:<cartId>` with one field per item
 * (`<restaurantId>:<itemId>` -> quantity), so every change is a single atomic
 * field update and concurrent requests can't overwrite each other.
 */

export { MAX_ITEM_QUANTITY };
const CART_TTL_SECONDS = 60 * 60 * 24 * 7;

// HINCRBY then clamp to [0, max]; removes the field at 0 and refreshes the TTL. Returns the new quantity.
const CHANGE_ITEM_SCRIPT = `
local quantity = redis.call("HINCRBY", KEYS[1], ARGV[1], ARGV[2])
local max = tonumber(ARGV[3])
if quantity <= 0 then
  redis.call("HDEL", KEYS[1], ARGV[1])
  quantity = 0
elseif quantity > max then
  redis.call("HSET", KEYS[1], ARGV[1], max)
  quantity = max
end
redis.call("EXPIRE", KEYS[1], ARGV[4])
return quantity
`;

export type Cart = Record<string, Record<string, number>>;

export class InvalidCartItemError extends Error {}

function cartKey(cartId: string) {
    return `cart:v2:${cartId}`;
}

function cartField(restaurantId: string, itemId: string) {
    return `${restaurantId}:${itemId}`;
}

export async function getCartId() {
    const cookieStore = await cookies();

    let cartId = cookieStore.get("cartID")?.value;

    if (!cartId) {
        cartId = randomUUID();
        cookieStore.set("cartID", cartId, { path: "/", maxAge: CART_TTL_SECONDS });
    }

    return cartId;
}

/** Groups hash fields back into `{ restaurantId: { itemId: quantity } }`. */
export function groupCartFields(fields: Record<string, unknown> | null): Cart {
    const cart: Cart = {};
    for (const [field, value] of Object.entries(fields ?? {})) {
        const separator = field.indexOf(":");
        const quantity = Number(value);
        if (separator <= 0 || !Number.isInteger(quantity) || quantity <= 0) continue;
        const restaurantId = field.slice(0, separator);
        const itemId = field.slice(separator + 1);
        (cart[restaurantId] ??= {})[itemId] = quantity;
    }
    return cart;
}

export async function getCart() {
    const cartId = await getCartId();
    const fields = await redis.hgetall<Record<string, unknown>>(cartKey(cartId));
    return { cartId, cart: groupCartFields(fields) };
}

async function applyDelta(cartId: string, restaurantId: string, itemId: string, delta: number): Promise<number> {
    const result = await redis.eval(
        CHANGE_ITEM_SCRIPT,
        [cartKey(cartId)],
        [cartField(restaurantId, itemId), String(delta), String(MAX_ITEM_QUANTITY), String(CART_TTL_SECONDS)],
    );
    return Number(result);
}

/** Adds `delta` to one item (clamped to 0..MAX_ITEM_QUANTITY) and returns its new quantity. */
export async function changeCartItem(restaurantId: string, itemId: string, delta: number) {
    if (!(await getMenuItem(restaurantId, itemId))) throw new InvalidCartItemError("Item is not on this restaurant's menu");
    const cartId = await getCartId();
    const quantity = await applyDelta(cartId, restaurantId, itemId, delta);
    return { cartId, quantity };
}

export async function addFinalizedOrderToCart(restaurantId: string, items: Array<{ id: string; quantity: number }>) {
    const [restaurant] = await getRestaurantsByIds([restaurantId]);
    if (!restaurant) throw new InvalidCartItemError("Finalized order restaurant no longer exists");
    const menuIds = new Set(restaurant.menu_items.map((item) => item.id));
    for (const item of items) {
        if (!menuIds.has(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1) {
            throw new InvalidCartItemError("Finalized order contains an invalid menu item");
        }
    }
    if (!items.length) throw new InvalidCartItemError("Finalized order is empty");

    const cartId = await getCartId();
    for (const item of items) await applyDelta(cartId, restaurantId, item.id, item.quantity);
    return getCart();
}

type CartItemDetails = {
    id: string;
    name: string;
    price: number;
    img: string;
    isVeg: boolean;
    quantity: number;
    total: number;
};

type RestaurantCartDetails = {
    restaurantId: string;
    restaurantName: string;
    restaurantImg: string;
    restaurantTotal: number;
    items: CartItemDetails[];
};

/** Cart contents with names and prices. Unknown restaurants or items are skipped, never fatal. */
export async function getCartDetails() {
    const { cart } = await getCart();
    const restaurants = await getRestaurantsByIds(Object.keys(cart));

    const result: Record<string, RestaurantCartDetails> = {};

    for (const restaurant of restaurants) {
        const menu = new Map(restaurant.menu_items.map((item) => [item.id, item]));
        const items: CartItemDetails[] = [];

        for (const [itemId, quantity] of Object.entries(cart[restaurant.id] ?? {})) {
            const item = menu.get(itemId);
            if (!item) continue;
            items.push({
                id: item.id,
                name: item.name,
                price: item.price,
                img: item.img,
                isVeg: item.veg,
                quantity,
                total: item.price * quantity,
            });
        }

        if (!items.length) continue;
        result[restaurant.id] = {
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            restaurantImg: restaurantImageUrl(restaurant.cloudinary_image_id),
            restaurantTotal: items.reduce((sum, item) => sum + item.total, 0),
            items,
        };
    }

    return { result };
}
