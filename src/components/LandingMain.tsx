import { div } from "framer-motion/client"
import { RestaurantCard } from "./RestaurantCard"

export function LandingMain() {

    return (

        <div className="px-15 py-10">

            <h1 className="text-2xl font-bold">Discover the best restaurants</h1>

            <div className="my-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">

                <RestaurantCard
                    id="1"
                    image="/restaurant.jpeg"
                    name="Restaurant Name"
                    cuisine="Cuisine Type"
                    location="Marathalli"
                    rating={4.5}
                />

            </div>
        </div>
    )

}