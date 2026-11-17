import "dotenv/config";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

/**
 * Seeds the restaurant catalogue from:
 *   data/restaurants.json          real restaurant listings (Swiggy format)
 *   data/restaurantMenu.json       hand-written menu items (ids kept stable)
 *   data/catalogue/restaurants.json  fictional restaurants that fill cuisine gaps
 *   data/catalogue/dishes.json       dish library grouped into stations
 *   data/catalogue/menu-plans.json   which stations each restaurant serves
 *
 * Generated items get stable ids (`<restaurantId>_<dish-slug>`), so re-running is idempotent.
 * Items no longer described by these files are removed from planned restaurants.
 */

type RawRestaurant = {
    info: {
        id: string;
        name: string;
        cloudinaryImageId?: string;
        locality?: string;
        areaName?: string;
        cuisines?: string[];
        avgRating?: number;
        totalRatingsString?: string;
        costForTwo?: string;
        sla?: { slaString?: string };
        isOpen?: boolean;
    };
};

type CuratedMenus = Record<string, {
    menu: Array<{ id: string; name: string; description?: string; price: number; veg: boolean; category?: string; rating?: number; img?: string }>;
}>;

type FictionalRestaurant = {
    id: string;
    name: string;
    cuisines: string[];
    locality: string;
    area: string;
    costForTwo: number;
    rating: number;
    ratingCount: string;
    deliveryTime: string;
    isOpen: boolean;
};

type Dish = { name: string; veg: boolean; price: number; category: string; description: string };
type MenuPlan = { stations: string[]; perStation: number; priceFactor: number };

type MenuItemRow = {
    id: string;
    restaurant_id: string;
    name: string;
    description: string;
    price: number;
    veg: boolean;
    category: string;
    rating: number | null;
    img: string;
};

function readJson<T>(file: string): T {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", file), "utf-8")) as T;
}

function parseCostForTwo(value?: string): number | null {
    const match = value?.match(/\d+/);
    return match ? Number(match[0]) : null;
}

function hashNumber(value: string): number {
    return parseInt(createHash("md5").update(value).digest("hex").slice(0, 8), 16);
}

function slugify(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Round to a menu-style price ending in 9 (e.g. 287 -> 289). */
function menuPrice(base: number, factor: number): number {
    return Math.max(19, Math.round((base * factor) / 10) * 10 - 1);
}

function buildMenu(restaurantId: string, plan: MenuPlan, dishes: Record<string, Dish[]>, curated: MenuItemRow[]): MenuItemRow[] {
    const items = [...curated];
    const taken = new Set(curated.map((item) => item.name.toLowerCase()));

    for (const station of plan.stations) {
        const library = dishes[station];
        if (!library) throw new Error(`Unknown station "${station}" in plan for ${restaurantId}`);

        // Deterministic per-restaurant shuffle so menus differ but never change between runs.
        const picked = [...library]
            .sort((a, b) => hashNumber(`${restaurantId}:${a.name}`) - hashNumber(`${restaurantId}:${b.name}`))
            .filter((dish) => !taken.has(dish.name.toLowerCase()))
            .slice(0, plan.perStation);

        for (const dish of picked) {
            taken.add(dish.name.toLowerCase());
            items.push({
                id: `${restaurantId}_${slugify(dish.name)}`,
                restaurant_id: restaurantId,
                name: dish.name,
                description: dish.description,
                price: menuPrice(dish.price, plan.priceFactor),
                veg: dish.veg,
                category: dish.category,
                rating: Math.round((3.8 + (hashNumber(`rating:${restaurantId}:${dish.name}`) % 11) / 10) * 10) / 10,
                img: "",
            });
        }
    }
    return items;
}

async function seedCatalogue() {
    const realRestaurants = readJson<RawRestaurant[]>("restaurants.json");
    const curatedMenus = readJson<CuratedMenus>("restaurantMenu.json");
    const fictionalRestaurants = readJson<FictionalRestaurant[]>("catalogue/restaurants.json");
    const dishes = readJson<Record<string, Dish[]>>("catalogue/dishes.json");
    const plans = readJson<Record<string, MenuPlan>>("catalogue/menu-plans.json");

    const restaurantRows = [
        ...realRestaurants.map(({ info }) => ({
            id: info.id,
            name: info.name,
            cloudinary_image_id: info.cloudinaryImageId ?? null,
            locality: info.locality ?? null,
            area_name: info.areaName ?? null,
            cuisines: info.cuisines ?? [],
            rating: info.avgRating ?? null,
            rating_count: info.totalRatingsString ?? null,
            cost_for_two: parseCostForTwo(info.costForTwo),
            delivery_time: info.sla?.slaString ?? null,
            is_open: info.isOpen ?? true,
        })),
        ...fictionalRestaurants.map((restaurant) => ({
            id: restaurant.id,
            name: restaurant.name,
            cloudinary_image_id: null,
            locality: restaurant.locality,
            area_name: restaurant.area,
            cuisines: restaurant.cuisines,
            rating: restaurant.rating,
            rating_count: restaurant.ratingCount,
            cost_for_two: restaurant.costForTwo,
            delivery_time: restaurant.deliveryTime,
            is_open: restaurant.isOpen,
        })),
    ];

    for (const { id, ...data } of restaurantRows) {
        await prisma.restaurants.upsert({ where: { id }, create: { id, ...data }, update: data });
    }
    console.log(`Upserted ${restaurantRows.length} restaurants`);

    const restaurantIds = new Set(restaurantRows.map((restaurant) => restaurant.id));
    const menuRestaurantIds = new Set([...Object.keys(curatedMenus), ...Object.keys(plans)]);

    const desired: MenuItemRow[] = [];
    for (const restaurantId of menuRestaurantIds) {
        if (!restaurantIds.has(restaurantId)) {
            console.warn(`Skipping menu for unknown restaurant ${restaurantId}`);
            continue;
        }
        const curated: MenuItemRow[] = (curatedMenus[restaurantId]?.menu ?? []).map((item) => ({
            id: item.id,
            restaurant_id: restaurantId,
            name: item.name,
            description: item.description ?? "",
            price: Math.round(item.price),
            veg: item.veg,
            category: item.category ?? "",
            rating: item.rating ?? null,
            img: item.img ?? "",
        }));
        const plan = plans[restaurantId];
        desired.push(...(plan ? buildMenu(restaurantId, plan, dishes, curated) : curated));
    }

    const desiredIds = new Set(desired.map((item) => item.id));
    if (desiredIds.size !== desired.length) throw new Error("Duplicate menu item ids generated");

    const removed = await prisma.menu_items.deleteMany({
        where: { restaurant_id: { in: [...menuRestaurantIds] }, id: { notIn: [...desiredIds] } },
    });

    const existing = new Map((await prisma.menu_items.findMany({ where: { id: { in: [...desiredIds] } } })).map((item) => [item.id, item]));
    const toCreate = desired.filter((item) => !existing.has(item.id));
    const toUpdate = desired.filter((item) => {
        const current = existing.get(item.id);
        return current && (Object.keys(item) as Array<keyof MenuItemRow>).some((key) => current[key] !== item[key]);
    });

    if (toCreate.length) await prisma.menu_items.createMany({ data: toCreate });
    for (const { id, ...data } of toUpdate) {
        await prisma.menu_items.update({ where: { id }, data });
    }

    const vegCount = desired.filter((item) => item.veg).length;
    console.log(`Menu items: ${desired.length} total (${vegCount} veg) across ${menuRestaurantIds.size} restaurants`);
    console.log(`  created ${toCreate.length}, updated ${toUpdate.length}, removed ${removed.count}`);
}

seedCatalogue()
    .catch((error) => {
        console.error("Catalogue seed failed:", error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
