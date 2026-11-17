import { QuantityButton } from "@/components/CartPage/QuantityButton";
import { VegNonVegIcon } from "../ui/VegNonVegIcon";
import { DishTile } from "../ui/DishTile";

type ItemCardProps = {
    itemId: string;
    restaurantId: string;
    itemName: string;
    itemPrice: number;
    itemImg: string;
    itemIsVeg: boolean;
    itemTotal: number;
};

export function ItemCard({ itemId, restaurantId, itemName, itemPrice, itemImg, itemIsVeg, itemTotal }: ItemCardProps) {
    return (
        <li className="flex items-center gap-3 py-4 sm:gap-4">
            <div className="relative size-14 shrink-0 sm:size-16">
                <DishTile name={itemName} img={itemImg} veg={itemIsVeg} compact />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <VegNonVegIcon veg={itemIsVeg} />
                    <p className="truncate font-semibold text-neutral-900">{itemName}</p>
                </div>
                <p className="mt-0.5 text-sm text-neutral-500">₹{itemPrice} each</p>
                {/* On phones the line total sits under the name to keep the row from cramping */}
                <p className="mt-0.5 text-sm font-bold text-neutral-900 sm:hidden">₹{itemTotal}</p>
            </div>

            <div className="w-24 shrink-0 sm:w-28">
                <QuantityButton itemId={itemId} restaurantId={restaurantId} itemName={itemName} />
            </div>

            <p className="hidden w-20 shrink-0 text-right font-bold tabular-nums text-neutral-900 sm:block">
                ₹{itemTotal}
            </p>
        </li>
    )
}
