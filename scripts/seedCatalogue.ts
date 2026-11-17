import "dotenv/config";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

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

type RawMenu = Record<string, {
    menu: Array<{
        id: string;
        name: string;
        description?: string;
        price: number;
        veg: boolean;
        category?: string;
        rating?: number;
        img?: string;
    }>;
}>;

function readJson<T>(file: string): T {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", file), "utf-8")) as T;
}

function parseCostForTwo(value?: string): number | null {
    const match = value?.match(/\d+/);
    return match ? Number(match[0]) : null;
}

async function seedCatalogue() {
    const restaurants = readJson<RawRestaurant[]>("restaurants.json");
    const menus = readJson<RawMenu>("restaurantMenu.json");

    for (const { info } of restaurants) {
        const data = {
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
        };
        await prisma.restaurants.upsert({ where: { id: info.id }, create: { id: info.id, ...data }, update: data });
    }
    console.log(`Upserted ${restaurants.length} restaurants`);

    const restaurantIds = new Set(restaurants.map(({ info }) => info.id));
    let itemCount = 0;
    for (const [restaurantId, { menu }] of Object.entries(menus)) {
        if (!restaurantIds.has(restaurantId)) {
            console.warn(`Skipping menu for unknown restaurant ${restaurantId}`);
            continue;
        }
        for (const item of menu) {
            const data = {
                restaurant_id: restaurantId,
                name: item.name,
                description: item.description ?? "",
                price: Math.round(item.price),
                veg: item.veg,
                category: item.category ?? "",
                rating: item.rating ?? null,
                img: item.img ?? "",
            };
            await prisma.menu_items.upsert({ where: { id: item.id }, create: { id: item.id, ...data }, update: data });
            itemCount++;
        }
    }
    console.log(`Upserted ${itemCount} menu items`);
}

seedCatalogue()
    .catch((error) => {
        console.error("Catalogue seed failed:", error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
