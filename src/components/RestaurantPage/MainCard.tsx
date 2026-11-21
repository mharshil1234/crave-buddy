import Image from "next/image";
import type { RestaurantDetails } from "@/types/restaurant";
import { Clock, IndianRupee, MapPin, Star } from "lucide-react";

export function MainCard({ restaurantDetails }: { restaurantDetails: RestaurantDetails | null }) {

    if (!restaurantDetails) return null;

    return (
        <div className="card overflow-hidden">
            <div className="relative h-40 bg-neutral-200 sm:h-52">
                {restaurantDetails.restaurantImg && (
                    <Image
                        src={restaurantDetails.restaurantImg}
                        alt=""
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="object-cover"
                    />
                )}
                <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                    <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{restaurantDetails.name}</h1>
                    <p className="mt-1 truncate text-sm font-medium text-orange-100">{restaurantDetails.cuisines.join(", ")}</p>
                </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 p-5 text-sm sm:grid-cols-4">
                <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Rating</dt>
                    <dd className="mt-1">
                        <span className="inline-flex items-center gap-1 rounded-md bg-rating px-2 py-0.5 font-bold text-white">
                            <Star size={13} fill="white" aria-hidden="true" />
                            {restaurantDetails.rating}
                        </span>
                    </dd>
                </div>
                <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Cost</dt>
                    <dd className="mt-1 flex items-center gap-1 font-semibold text-neutral-900">
                        <IndianRupee size={14} aria-hidden="true" className="text-brand" />
                        {restaurantDetails.priceForTwo} for two
                    </dd>
                </div>
                <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Delivery</dt>
                    <dd className="mt-1 flex items-center gap-1 font-semibold text-neutral-900">
                        <Clock size={14} aria-hidden="true" className="text-brand" />
                        {restaurantDetails.deliveryTime}
                    </dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Outlet</dt>
                    <dd className="mt-1 flex items-center gap-1 font-semibold text-neutral-900">
                        <MapPin size={14} aria-hidden="true" className="shrink-0 text-brand" />
                        <span className="truncate">{restaurantDetails.location}</span>
                    </dd>
                </div>
            </dl>
        </div>
    )
}
