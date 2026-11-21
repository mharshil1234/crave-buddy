import prisma from "@/lib/prisma";
import type { Prisma } from "../../generated/prisma/client";
import type { MenuItem, RestaurantWithMenu } from "@/types/restaurant";

/**
 * The single source of truth for restaurant and menu data.
 * Everything that reads the catalogue goes through this module.
 */

type DB = typeof prisma | Prisma.TransactionClient;

const withMenu = {
    menu_items: { orderBy: { id: "asc" } },
} satisfies Prisma.restaurantsInclude;

export type CatalogueRestaurant = Prisma.restaurantsGetPayload<object>;
export type CatalogueRestaurantWithMenu = Prisma.restaurantsGetPayload<{ include: typeof withMenu }>;
export type CatalogueMenuItem = Prisma.menu_itemsGetPayload<object>;

const SWIGGY_IMAGE_BASE = "https://media-assets.swiggy.com/swiggy/image/upload/";
const FALLBACK_RESTAURANT_IMAGE = "/restaurant.jpeg";

export function restaurantImageUrl(cloudinaryImageId: string | null | undefined): string {
    if (!cloudinaryImageId) return FALLBACK_RESTAURANT_IMAGE;
    return cloudinaryImageId.startsWith("http") ? cloudinaryImageId : `${SWIGGY_IMAGE_BASE}${cloudinaryImageId}`;
}

export function formatCostForTwo(costForTwo: number | null | undefined): string {
    return costForTwo ? `₹${costForTwo} for two` : "";
}

export function restaurantLocation(restaurant: Pick<CatalogueRestaurant, "locality" | "area_name">): string {
    return [restaurant.locality, restaurant.area_name].filter(Boolean).join(", ");
}

export function toMenuItem(item: CatalogueMenuItem): MenuItem {
    return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        veg: item.veg,
        category: item.category,
        rating: item.rating ?? 0,
        img: item.img,
    };
}

/** The restaurant + menu shape used by the restaurant page, cart, mood board and mood room. */
export function toRestaurantWithMenu(restaurant: CatalogueRestaurantWithMenu): RestaurantWithMenu {
    return {
        name: restaurant.name,
        restaurantImg: restaurantImageUrl(restaurant.cloudinary_image_id),
        location: restaurantLocation(restaurant),
        cuisines: restaurant.cuisines,
        rating: restaurant.rating ?? 0,
        priceForTwo: restaurant.cost_for_two ?? 0,
        deliveryTime: restaurant.delivery_time ?? "",
        menu: restaurant.menu_items.map(toMenuItem),
    };
}

export async function listRestaurants({ limit }: { limit?: number } = {}, db: DB = prisma) {
    return db.restaurants.findMany({ orderBy: { id: "asc" }, take: limit });
}

export async function listRestaurantsWithMenus({ openOnly = false }: { openOnly?: boolean } = {}, db: DB = prisma) {
    return db.restaurants.findMany({
        where: { menu_items: { some: {} }, ...(openOnly ? { is_open: true } : {}) },
        orderBy: { id: "asc" },
        include: withMenu,
    });
}

export async function getRestaurant(restaurantId: string, db: DB = prisma) {
    return db.restaurants.findUnique({ where: { id: restaurantId }, include: withMenu });
}

export async function getRestaurantsByIds(restaurantIds: string[], db: DB = prisma) {
    if (!restaurantIds.length) return [];
    return db.restaurants.findMany({ where: { id: { in: restaurantIds } }, include: withMenu });
}

export async function getMenuItem(restaurantId: string, itemId: string, db: DB = prisma) {
    return db.menu_items.findFirst({ where: { id: itemId, restaurant_id: restaurantId } });
}
