import { useState, useEffect } from "react";
import type { MenuItem } from "@/types/restaurant";
import { MenuItemCard } from "@/components/RestaurantPage/MenuItemCard";
import { Menu } from "lucide-react";

export function MenuList({ menu }: { menu: MenuItem[] | null }) {
    return (
        <div className="w-full mt-8">
            {menu?.map((item) => (
                <MenuItemCard key={item.id} item={item} />
            ))}
        </div>
    )
}