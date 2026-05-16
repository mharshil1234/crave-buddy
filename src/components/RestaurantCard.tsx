"use client";

import { useRouter } from "next/navigation";

type CardProps = {
    id: string;
    image: string;
    name: string;
    cuisine: string;
    rating?: string;
    location?: string;
}

export function RestaurantCard({ id,image, name, cuisine, rating, location }: CardProps) {

    const router = useRouter();

    return (

        <div
        className="bg-white rounded-xl shadow-md w-90 hover:shadow-lg transition-shadow duration-200 hover: cursor-pointer"
        onClick={() => router.push(`/restaurant/${id}`)}
        >
            
            <div className="relative shadow-md hover:shadow-lg transition-shadow duration-200">
                
                <img src={image} alt={name} className="w-full h-28 object-cover rounded-t-xl mb-4 bg-gray-200" />
                <h2 className="absolute bottom-1 left-2.5 text-xl font-bold mb-1 text-white">{name}</h2>
                
                {rating !== undefined && (
                    <div className="absolute bottom-2.5 right-2.5 flex items-center mt-2">
                        <span className="text-white">★</span>
                        <span className="ml-1 text-white">{rating}</span>
                    </div>
                )}

            </div>

            <div className="px-4 pb-4">
                <p className="text-gray-600 mb-1 text-sm">{cuisine}</p>
                <p className="text-gray-600 mb-0 text-sm">{location}</p>
            </div>

        </div>

    )

}