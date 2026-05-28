export function VegNonVegIcon({ veg }: { veg: boolean }) {
    return (
        <div className={`flex items-center justify-center font-bold border-2 p-0.5 rounded ${veg ? 'border-green-500' : 'border-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </div>
    )
}