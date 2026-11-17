import { QuantityButton } from "@/components/CartPage/QuantityButton";
import { VegNonVegIcon } from "../ui/VegNonVegIcon";

type ItemCardProps = {
    itemId: string;
    restaurantId: string;
    itemName: string;
    itemPrice: number;
    itemImg: string;
    itemIsVeg: boolean;
    itemTotal: number;
};

export function ItemCard({ itemId, restaurantId, itemName, itemImg, itemIsVeg, itemTotal }: ItemCardProps) {
    return (
        <div className="w-full flex items-center gap-3 sm:gap-6">
            <div className="min-w-0 flex flex-1 items-center gap-4">
                <VegNonVegIcon veg={itemIsVeg} />
                <span className="truncate">{itemName}</span>
            </div>

            <div className="ml-auto flex w-28 shrink-0 sm:w-40">
                <QuantityButton itemId={itemId} restaurantId={restaurantId} />
            </div>

            <div className="w-16 shrink-0 text-right font-bold sm:w-24">
                ₹ {itemTotal}
            </div>
        </div>
    )
}
