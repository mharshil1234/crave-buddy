import { VegNonVegIcon } from "../ui/VegNonVegIcon"

type TitleCardProps = {
    userQuery: string;
    createdAt: string;
    isVeg: boolean
}

export function TitleCard({ userQuery, createdAt, isVeg }: TitleCardProps) {
    return (
        <div className="shadow-xl rounded-2xl p-8 w-200 flex justify-center items-center flex-col gap-4 bg-white mt-4">
            <div className="flex items-center gap-2">
                <VegNonVegIcon veg={isVeg} />
                <h1 className="font-bold text-2xl">
                    {userQuery}
                </h1>
            </div>
            <p className="text-gray-500 text-sm">
                Created on{" "}
                {new Date(createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                })}
            </p>
        </div>
    )
}