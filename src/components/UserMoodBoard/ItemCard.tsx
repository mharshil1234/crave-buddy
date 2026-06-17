import type { MenuItem } from "@/types/restaurant";
import { QuantityButton } from "@/components/ui/QuantityButton";
import { VegNonVegIcon } from "@/components/ui/VegNonVegIcon";
import { Star } from "lucide-react";
import Image from "next/image";

type ItemCardProps = {
    item: MenuItem;
    restaurantId: string;
};

export function ItemCard({ item, restaurantId }: ItemCardProps) {
    return (
        <div className="flex w-full items-center gap-4 border-t border-gray-200 py-4 first:border-t-0 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <VegNonVegIcon veg={item.veg} />
                    <span className="rounded-md bg-[#256f3a] px-2 py-0.5 text-xs font-bold text-white">
                        <span className="inline-flex items-center gap-1">
                            <Star size={11} fill="white" />
                            {item.rating}
                        </span>
                    </span>
                </div>

                <h3 className="mt-2 truncate text-base font-bold">{item.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.description}</p>
                <p className="mt-2 font-bold">₹ {item.price}</p>
            </div>

            <div className="relative h-28 w-28 shrink-0">
                <Image
                    src="/restaurant.jpeg"
                    alt={item.name}
                    width={112}
                    height={112}
                    className="h-full w-full rounded-lg bg-gray-200 object-cover"
                />
                <QuantityButton itemId={item.id} restaurantId={restaurantId} />
            </div>
        </div>
    );
}
