import { Bookmark, CalendarDays, Share2 } from "lucide-react";
import { VegNonVegIcon } from "../ui/VegNonVegIcon";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type TitleCardProps = {
    moodBoardId: string;
    userQuery: string;
    createdAt: string;
    isVeg: boolean;
    restaurantCount: number;
    dishCount: number;
}

export function TitleCard({ userQuery, createdAt, isVeg, restaurantCount, dishCount, moodBoardId }: TitleCardProps) {

    const router = useRouter();

    const { data: session } = useSession();

    const [isSaved, setIsSaved] = useState(false);

    const handleSave = async () => {
        try {
            if (!session) {
                const currentPath = window.location.pathname + window.location.search;
                router.push(`/signin?callbackUrl=${encodeURIComponent(currentPath)}`);
                return;
            }
            const response = await fetch(`/api/mood-board/save`, {
                method: "POST",
                body: JSON.stringify({ id: moodBoardId })
            });
            if (!response.ok) {
                throw new Error("Response not ok");
            }
            const data = await response.json();
            if (data.success === true) {
                toast.success("Mood Board Saved Successfully!");
                setIsSaved(true);
                return;
            }
            throw new Error("Success: false");
        }
        catch (error) {
            console.log(error);
            toast.error("Couldn't save Mood Board");
            return;
        }
    }

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        } catch {
            toast.error("Failed to copy link");
        }
    };

    useEffect(() => {
        const getIsSaved = async () => {
            try {
                const response = await fetch(`/api/mood-board/is-saved?id=${moodBoardId}`);
                const data = await response.json();
                if (data.isSaved === true) setIsSaved(true);
            }
            catch (error) {
                console.log(error);
            }
        }
        getIsSaved();
    }, [moodBoardId])

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

                    <div className="flex flex-col items-start gap-2 sm:items-end">

                        <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-600">
                            <CalendarDays size={16} />
                            {new Date(createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </div>

                        <div className="flex items-center gap-2 justify-center items-center">
                            <button 
                            className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-orange-500"
                            onClick={handleShare}
                            >
                                <Share2 size={16} />
                                Share
                            </button>

                            {!isSaved &&
                                <button
                                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-orange-500"
                                    onClick={handleSave}
                                >
                                    <Bookmark size={16} />
                                    Save
                                </button>
                            }
                        </div>
                    </div>

                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
                        <p className="text-2xl font-extrabold text-orange-700">{restaurantCount}</p>
                        <p className="text-sm font-semibold text-orange-900">
                            {restaurantCount === 1 ? "restaurant" : "restaurants"} matched
                        </p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                        <p className="text-2xl font-extrabold text-emerald-700">{dishCount}</p>
                        <p className="text-sm font-semibold text-emerald-900">
                            {dishCount === 1 ? "dish" : "dishes"} recommended
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
