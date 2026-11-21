import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";

type CardProps = {
    id: string;
    image: string;
    name: string;
    cuisine: string;
    rating?: string;
    location?: string;
}

export function RestaurantCard({ id, image, name, cuisine, rating, location }: CardProps) {
    return (
        <Link
            href={`/restaurant/${id}`}
            className="group card block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
                <Image
                    src={image}
                    alt=""
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                {rating && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-rating px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                        {rating}
                        <Star size={11} fill="white" aria-label="stars" />
                    </span>
                )}
            </div>

            <div className="p-4">
                <h2 className="truncate text-lg font-bold text-neutral-900">{name}</h2>
                <p className="mt-1 truncate text-sm text-neutral-600">{cuisine}</p>
                {location && (
                    <p className="mt-1 flex items-center gap-1 truncate text-sm text-neutral-400">
                        <MapPin size={14} aria-hidden="true" className="shrink-0" />
                        {location}
                    </p>
                )}
            </div>
        </Link>
    )
}

export function RestaurantCardSkeleton() {
    return (
        <div className="card overflow-hidden" aria-hidden="true">
            <div className="aspect-[16/10] animate-pulse bg-neutral-200" />
            <div className="space-y-2 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200" />
            </div>
        </div>
    );
}
