import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";

/**
 * Dish image, or a tinted placeholder tile when the catalogue has no photo
 * (better than repeating one stock photo for every item).
 */
// next/image only accepts local files or hosts listed in next.config.ts.
function isRenderableImage(img?: string): img is string {
    return !!img && (img.startsWith("/") || img.startsWith("https://media-assets.swiggy.com/"));
}

export function DishTile({ name, img, veg, compact = false, className = "" }: { name: string; img?: string; veg: boolean; compact?: boolean; className?: string }) {
    if (isRenderableImage(img)) {
        return (
            <Image
                src={img}
                alt={name}
                fill
                sizes="144px"
                className={`${compact ? "rounded-xl" : "rounded-2xl"} object-cover ${className}`}
            />
        );
    }

    return (
        <div
            role="img"
            aria-label={name}
            className={`flex size-full flex-col items-center justify-center gap-1 px-2 text-center ${compact ? "rounded-xl" : "rounded-2xl"} ${veg
                ? "bg-linear-to-br from-green-50 to-emerald-100 text-green-700"
                : "bg-linear-to-br from-orange-50 to-red-100 text-brand-ink"
                } ${className}`}
        >
            <UtensilsCrossed size={compact ? 18 : 22} aria-hidden="true" className="opacity-60" />
            {!compact && <span className="line-clamp-2 text-xs font-bold leading-tight opacity-80">{name}</span>}
        </div>
    );
}
