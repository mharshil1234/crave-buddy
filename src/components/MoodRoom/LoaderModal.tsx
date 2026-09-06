export function LoaderModal({ isLoading }: { isLoading: boolean }) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
                    <p className="text-sm text-gray-600">
                        Loading...
                    </p>
                </div>
            </div>
        </div>
    );
}
