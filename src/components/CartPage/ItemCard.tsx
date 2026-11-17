import { QuantityButton } from "@/components/CartPage/QuantityButton";
import { VegNonVegIcon } from "../ui/VegNonVegIcon";

type ItemCardProps = {
    itemId: string;
    restaurantId: string;
    itemName: string;
    itemPrice: number;
    itemIsVeg: boolean;
    itemTotal: number;
};

export function ItemCard({ itemId, restaurantId, itemName, itemPrice, itemIsVeg, itemTotal }: ItemCardProps) {
    return (
        <div className="flex items-center gap-3 py-3 sm:gap-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <VegNonVegIcon veg={itemIsVeg} />
                <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-900">{itemName}</p>
                    <p className="text-xs text-neutral-500">₹{itemPrice} each</p>
                </div>
            </div>

            <div className="w-24 shrink-0 sm:w-28">
                <QuantityButton itemId={itemId} restaurantId={restaurantId} />
            </div>

            <div className="w-16 shrink-0 text-right font-bold text-neutral-900 sm:w-20">
                ₹{itemTotal}
            </div>
        </div>
    )
}
