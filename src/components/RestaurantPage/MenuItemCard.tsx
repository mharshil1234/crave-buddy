import type { MenuItem } from "@/types/restaurant"
import { Star } from "lucide-react"

export function MenuItemCard({ item } : { item: MenuItem }) {
    return (
        <div className="w-full flex mt-4 border-t-1 py-4">
            <div className="w-[80%]">
                <div className="w-full flex items-center gap-4 font-bold">
                    {item.veg &&
                        <div className="flex items-center justify-center font-bold border-2 p-0.5 rounded border-green-500">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        </div>
                    }
                    
                    {!item.veg &&
                        <div className="flex items-center justify-center font-bold border-2 p-0.5 rounded border-red-500">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        </div>
                    }
                </div>
                <div className="font-bold text-lg">{item.name}</div>
                <div><span className="font-bold inline-flex items-center px-2 py-0.5 rounded-md bg-[#256f3a] gap-1 text-white text-xs"><Star size={11} fill="white"/>{item.rating}</span></div>
                <div className="font-bold">₹ {item.price}</div>
                <div>{item.description}</div>
            </div>
            <div>
                Image
            </div>
        </div>
    )
}