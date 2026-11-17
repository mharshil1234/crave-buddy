import { beforeEach, describe, expect, it, vi } from "vitest";

const getRestaurantsByIds = vi.fn();
vi.mock("@/lib/catalogue", () => ({ getRestaurantsByIds: (ids: string[]) => getRestaurantsByIds(ids) }));

import { EmptyRecommendationError, validateBoard } from "./validate";

const item = (id: string, veg: boolean) => ({ id, veg });
const catalogue = [
    { id: "r1", menu_items: [item("a", true), item("b", false), item("c", true), item("d", true), item("e", true), item("f", true)] },
    { id: "r2", menu_items: [item("x", true)] },
    { id: "empty", menu_items: [] },
];

beforeEach(() => {
    getRestaurantsByIds.mockImplementation(async (ids: string[]) => catalogue.filter((r) => ids.includes(r.id)));
});

describe("validateBoard", () => {
    it("drops unknown restaurants, restaurants without menus and foreign items", async () => {
        const board = await validateBoard({ r1: ["a", "x"], ghost: ["a"], empty: ["a"], r2: ["x"] }, { isVeg: false });
        expect(board).toEqual({ r1: ["a"], r2: ["x"] });
    });

    it("filters non-veg items when veg only", async () => {
        expect(await validateBoard({ r1: ["a", "b"] }, { isVeg: true })).toEqual({ r1: ["a"] });
    });

    it("dedupes and caps items per restaurant", async () => {
        const board = await validateBoard({ r1: ["a", "a", "c", "d", "e", "f"] }, { isVeg: false });
        expect(board.r1).toEqual(["a", "c", "d", "e"]);
    });

    it("throws when nothing survives or the shape is wrong", async () => {
        await expect(validateBoard({ r1: ["b"] }, { isVeg: true })).rejects.toBeInstanceOf(EmptyRecommendationError);
        await expect(validateBoard({}, { isVeg: false })).rejects.toBeInstanceOf(EmptyRecommendationError);
        await expect(validateBoard({ r1: "a" }, { isVeg: false })).rejects.toBeInstanceOf(EmptyRecommendationError);
    });
});
