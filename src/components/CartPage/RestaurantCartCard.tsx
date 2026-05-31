export function RestaurantCartCard({ restaurantId }: { restaurantId: string }) {

    return (
        <div className="w-full p-4 bg-white rounded-xl shadow-md flex items-center">
            <h1>{restaurantId}</h1>
        </div>
    )
}