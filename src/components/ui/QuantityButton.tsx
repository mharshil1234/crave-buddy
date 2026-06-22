import { useCartStore } from "@/stores/cartStore";

export function QuantityButton({ itemId, restaurantId }: { itemId: string; restaurantId: string }) {

    const quantity = useCartStore((state) => state.cart[itemId] || 0);
    const updateQuantity = useCartStore((state) => state.updateQuantity)

    const updateItemQuantity = async (newQuantity: number) => {
        const previousQuantity = quantity;
        updateQuantity(itemId, newQuantity);
        try {
            const response = await fetch("/api/cart/update" , {
                method: "POST",
                body: JSON.stringify({ restaurantId, itemId, newQuantity })
            })

            if(!response.ok) {
                throw new Error("Failed to update cart");
            }
        } catch (error) {
            console.error("Error updating item quantity:", error);
            updateQuantity(itemId, previousQuantity);
        }
    }

    return (
        <div className="absolute bottom-[0.2rem] left-1/2 -translate-x-1/2 bg-white w-[70%] h-10 rounded-xl shadow-lg flex items-center justify-center">

            {quantity == 0 && (
                <button
                    onClick={() => updateItemQuantity(1)}
                    className="w-full h-full font-bold text-green-600 rounded-xl hover:cursor-pointer hover:bg-gray-200"
                >
                    ADD
                </button>
            )}

            {quantity > 0 && (
                <div className="flex items-center justify-between w-full px-1">
                    <button
                        onClick={() => updateItemQuantity(quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-green-600 font-bold text-xl rounded-xl hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                        -
                    </button>

                    <span className="font-bold text-green-600">
                        {quantity}
                    </span>

                    <button
                        onClick={() => updateItemQuantity(quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-green-600 font-bold text-xl rounded-xl hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                        +
                    </button>
                </div>
            )}
        </div>
    )
}