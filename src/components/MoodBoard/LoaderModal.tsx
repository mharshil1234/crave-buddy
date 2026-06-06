export function LoaderModal({isLoading}: {isLoading: boolean}) {

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Generating your mood board...</h2>
                <p className="text-gray-600">This may take a moment. Please wait.</p>
            </div>
        </div>
    );
}