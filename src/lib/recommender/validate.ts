import { z } from "zod";
import { getRestaurantsByIds } from "@/lib/catalogue";
import type { BoardRecommendation } from "./types";

export const MAX_BOARD_RESTAURANTS = 4;
export const MAX_ITEMS_PER_RESTAURANT = 4;

export class EmptyRecommendationError extends Error {
    constructor() {
        super("No valid dishes matched this craving");
    }
}

const rawBoardSchema = z.record(z.string(), z.array(z.string()));

/**
 * Keeps only what the catalogue can back up: real restaurants with menus,
 * items that belong to that restaurant, veg-only when requested, deduped and capped.
 * Throws EmptyRecommendationError if nothing survives.
 */
export async function validateBoard(raw: unknown, { isVeg }: { isVeg: boolean }): Promise<BoardRecommendation> {
    const parsed = rawBoardSchema.safeParse(raw);
    if (!parsed.success) throw new EmptyRecommendationError();

    const requestedIds = Object.keys(parsed.data).slice(0, MAX_BOARD_RESTAURANTS);
    const restaurants = new Map((await getRestaurantsByIds(requestedIds)).map((restaurant) => [restaurant.id, restaurant]));

    const board: BoardRecommendation = {};
    for (const restaurantId of requestedIds) {
        const restaurant = restaurants.get(restaurantId);
        if (!restaurant?.menu_items.length) continue;

        const menu = new Map(restaurant.menu_items.map((item) => [item.id, item]));
        const itemIds = [...new Set(parsed.data[restaurantId])]
            .filter((itemId) => {
                const item = menu.get(itemId);
                return item !== undefined && (!isVeg || item.veg);
            })
            .slice(0, MAX_ITEMS_PER_RESTAURANT);

        if (itemIds.length) board[restaurantId] = itemIds;
    }

    if (!Object.keys(board).length) throw new EmptyRecommendationError();
    return board;
}
