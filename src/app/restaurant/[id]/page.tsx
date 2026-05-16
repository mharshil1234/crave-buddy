type RestaurantPageProps = {
    params: {
        id: string;
    }
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {

    const { id } = await params;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold">Restaurant Id: {id}</h1>
        </div>
    )
}