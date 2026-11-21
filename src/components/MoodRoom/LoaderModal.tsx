export function LoaderModal({ isLoading }: { isLoading: boolean }) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 px-4" role="status" aria-live="polite">
            <div className="card p-6 shadow-xl">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-10 animate-spin rounded-full border-4 border-brand-soft border-t-brand" />
                    <p className="text-sm font-medium text-neutral-600">
                        Loading...
                    </p>
                </div>
            </div>
        </div>
    );
}
