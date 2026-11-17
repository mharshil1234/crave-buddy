import { Search as SearchIcon, X } from "lucide-react";

type SearchProps = {
    value: string;
    onChange: (value: string) => void;
};

export function Search({ value, onChange }: SearchProps) {

    return (
        <div className="relative mt-4">
            <SearchIcon size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                aria-label="Search for dishes"
                className="w-full rounded-full border border-gray-300 py-2 pl-11 pr-10 focus:outline-none focus:ring-2 focus:ring-[#ff5200]"
                placeholder="Search for dishes"
            />
            {value && (
                <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => onChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 cursor-pointer hover:bg-gray-100"
                >
                    <X size={16} aria-hidden="true" />
                </button>
            )}
        </div>
    )
}
