import type { RestaurantMainCard } from "@/types/restaurant";

export function MainCard({ restaurantMainDetails }: { restaurantMainDetails: RestaurantMainCard | null }) {
    
    const info = restaurantMainDetails?.info;
    
    return (
        <div>
            Hello
        </div>
    )
}