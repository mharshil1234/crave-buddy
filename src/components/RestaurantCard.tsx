"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star } from "lucide-react";

type CardProps = {
    id: string;
    image: string;
    name: string;
    cuisine: string;
    rating?: string;
    location?: string;
}

export function RestaurantCard({ id, image, name, cuisine, rating, location }: CardProps) {

    const router = useRouter();

    return (

        <div
        className="bg-white rounded-xl shadow-md w-90 hover:shadow-lg transition-shadow duration-200 hover:cursor-pointer"
        onClick={() => router.push(`/restaurant/${id}`)}
        >
            
            <div className="relative h-28 rounded-t-xl overflow-hidden bg-gray-200">
                
                <Image src={image} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 360px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h2 className="absolute bottom-1 left-2.5 text-xl font-bold mb-1 text-white">{name}</h2>
                
                {rating !== undefined && rating && (
                    <div className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-md bg-[#256f3a] gap-1 text-white text-xs font-bold">
                        <span>{rating}</span>
                        <Star size={11} fill="white" />
                    </div>
                )}

            </div>

            <div className="px-4 pb-4 mt-2">
                <p className="text-gray-600 mb-1 text-sm">{cuisine}</p>
                <p className="text-gray-600 mb-0 text-sm">{location}</p>
            </div>

        </div>

    )

}