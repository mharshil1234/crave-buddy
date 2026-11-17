import { beforeEach, describe, expect, it, vi } from "vitest";

const redis = vi.hoisted(() => ({ eval: vi.fn(), hgetall: vi.fn() }));
const getMenuItem = vi.fn();
const getRestaurantsByIds = vi.fn();
vi.mock("@/lib/redis", () => ({ redis }));
vi.mock("@/lib/catalogue", () => ({
    getMenuItem: (...args: unknown[]) => getMenuItem(...args),
    getRestaurantsByIds: (...args: unknown[]) => getRestaurantsByIds(...args),
    restaurantImageUrl: () => "/restaurant.jpeg",
}));
vi.mock("next/headers", () => ({
    cookies: async () => ({ get: () => ({ value: "cart-1" }), set: vi.fn() }),
}));

import { addFinalizedOrderToCart, changeCartItem, getCart, getCartDetails, groupCartFields, InvalidCartItemError, MAX_ITEM_QUANTITY } from "./cart";

beforeEach(() => vi.clearAllMocks());

describe("groupCartFields", () => {
    it("groups fields by restaurant and skips junk", () => {
        expect(groupCartFields({ "r1:a": 2, "r1:b": "3", "r2:x:y": 1, bad: 4, "r3:z": 0, "r4:q": "nan" })).toEqual({
            r1: { a: 2, b: 3 },
            r2: { "x:y": 1 },
        });
        expect(groupCartFields(null)).toEqual({});
    });
});

describe("changeCartItem", () => {
    it("sends the delta atomically to the item's hash field", async () => {
        getMenuItem.mockResolvedValue({ id: "a" });
        redis.eval.mockResolvedValue(3);
        await expect(changeCartItem("r1", "a", 1)).resolves.toEqual({ cartId: "cart-1", quantity: 3 });
        expect(redis.eval).toHaveBeenCalledWith(expect.any(String), ["cart:v2:cart-1"], ["r1:a", "1", String(MAX_ITEM_QUANTITY), expect.any(String)]);
    });

    it("rejects items that are not on the menu", async () => {
        getMenuItem.mockResolvedValue(null);
        await expect(changeCartItem("r1", "nope", 1)).rejects.toBeInstanceOf(InvalidCartItemError);
        expect(redis.eval).not.toHaveBeenCalled();
    });
});

describe("getCart", () => {
    it("reads the v2 hash", async () => {
        redis.hgetall.mockResolvedValue({ "r1:a": 2 });
        await expect(getCart()).resolves.toEqual({ cartId: "cart-1", cart: { r1: { a: 2 } } });
        expect(redis.hgetall).toHaveBeenCalledWith("cart:v2:cart-1");
    });
});

describe("addFinalizedOrderToCart", () => {
    it("rejects items outside the restaurant menu before writing", async () => {
        getRestaurantsByIds.mockResolvedValue([{ id: "r1", menu_items: [{ id: "a" }] }]);
        await expect(addFinalizedOrderToCart("r1", [{ id: "a", quantity: 1 }, { id: "z", quantity: 1 }])).rejects.toBeInstanceOf(InvalidCartItemError);
        expect(redis.eval).not.toHaveBeenCalled();
    });
});

describe("getCartDetails", () => {
    it("skips unknown restaurants and items and totals the rest", async () => {
        redis.hgetall.mockResolvedValue({ "r1:a": 2, "r1:gone": 1, "ghost:x": 1 });
        getRestaurantsByIds.mockResolvedValue([
            { id: "r1", name: "R1", cloudinary_image_id: null, menu_items: [{ id: "a", name: "A", price: 100, img: "", veg: true }] },
        ]);
        const { result } = await getCartDetails();
        expect(Object.keys(result)).toEqual(["r1"]);
        expect(result.r1).toMatchObject({ restaurantTotal: 200, items: [{ id: "a", quantity: 2, total: 200 }] });
    });
});
