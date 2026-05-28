import type { MenuItem } from "@/types/restaurant"
import { Star } from "lucide-react"
import { VegNonVegIcon } from "../ui/VegNonVegIcon"
import { QuantityButton } from "../ui/QuantityButton"

export function MenuItemCard({ item }: { item: MenuItem }) {
    return (
        <div className="w-full flex mt-4 border-t-1 py-4">
            <div className="w-[70%] mt-2">
                <div className="w-full flex items-center gap-4 font-bold">
                    <VegNonVegIcon veg={item.veg} />
                </div>
                <div className="font-bold text-lg">{item.name}</div>
                <div><span className="font-bold inline-flex items-center px-2 py-0.5 rounded-md bg-[#256f3a] gap-1 text-white text-xs"><Star size={11} fill="white" />{item.rating}</span></div>
                <div className="font-bold">₹ {item.price}</div>
                <div className="mt-2">{item.description}</div>
            </div>
            <div className="w-40 h-40 relative">
                <img src="/restaurant.jpeg" alt={item.name} className="w-full h-full object-cover rounded-lg" width={128} height={128} />
                <QuantityButton />
            </div>
        </div>
    )
}