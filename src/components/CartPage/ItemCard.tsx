import { QuantityButton } from "@/components/CartPage/QuantityButton";

type ItemCardProps = {
    itemId: string;
    restaurantId: string;
    itemName: string;
    itemPrice: number;
    itemImg: string;
    quantity: number;
    itemTotal: number;
};

export function ItemCard({ itemId, restaurantId, itemName, itemImg, itemTotal }: ItemCardProps) {
    return (
        <div className="w-full flex items-center gap-6">
            <div className="min-w-0 flex flex-1 items-center gap-4">
                <img src={itemImg} alt={itemName} className="w-10 h-10 shrink-0 object-cover rounded-md" />
                <span className="truncate">{itemName}</span>
            </div>

            <div className="flex w-40 shrink-0">
                <QuantityButton itemId={itemId} restaurantId={restaurantId} />
            </div>

            <div className="w-40 shrink-0 text-right font-bold">
                ₹ {itemTotal}
            </div>
        </div>
    )
}
