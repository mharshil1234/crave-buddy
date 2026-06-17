import { CalendarDays } from "lucide-react";
import { VegNonVegIcon } from "../ui/VegNonVegIcon";

type TitleCardProps = {
    userQuery: string;
    createdAt: string;
    isVeg: boolean;
    restaurantCount: number;
    dishCount: number;
}

export function TitleCard({ userQuery, createdAt, isVeg, restaurantCount, dishCount }: TitleCardProps) {
    return (
        <div className="mt-2 overflow-hidden rounded-2xl border border-orange-100 border-t-8 border-t-orange-500 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="flex flex-col gap-5 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-3">
                            <VegNonVegIcon veg={isVeg} />
                            <h1 className="min-w-0 text-2xl font-extrabold text-gray-950 sm:text-3xl">
                                {userQuery}
                            </h1>
                        </div>
                    </div>

                    <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-600">
                        <CalendarDays size={16} />
                        {new Date(createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
                        <p className="text-2xl font-extrabold text-orange-700">{restaurantCount}</p>
                        <p className="text-sm font-semibold text-orange-900">
                            {restaurantCount === 1 ? "restaurant" : "restaurants"}
                        </p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                        <p className="text-2xl font-extrabold text-emerald-700">{dishCount}</p>
                        <p className="text-sm font-semibold text-emerald-900">
                            AI-selected {dishCount === 1 ? "dish" : "dishes"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
