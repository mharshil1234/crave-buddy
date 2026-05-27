import type { RestaurantDetails } from "@/types/restaurant";
import { Star } from "lucide-react";

export function MainCard({ restaurantDetails }: { restaurantDetails: RestaurantDetails | null }) {

    return (
        <div className="w-full rounded-2xl my-8 shadow-lg p-6 border border-gray-200 bg-white">

            <div className="w-full flex items-center mb-4 gap-4 font-bold">

                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#256f3a] gap-1 text-white"><Star size={15} fill="white"/>{restaurantDetails?.rating}</span>
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                <span className="">₹{restaurantDetails?.priceForTwo} for two</span>
                
            </div>

            <div className="mb-4">
                <span className="text-sm text-[#ff5200] font-bold">{restaurantDetails?.cuisines.join(", ")}</span>
            </div>

            <div className="w-full flex items-center mb-4 gap-4">
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                <span className="text-[15px] font-bold">Outlet</span>
                <span className="text-[15px] text-[#676a6d]">{restaurantDetails?.location}</span>
            </div>
        
            <div className="w-full flex items-center gap-4">
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                <span className="text-[15px] font-bold">{restaurantDetails?.deliveryTime}</span>
            </div>

        </div>
    )
}