type TitleCardProps = {
    userQuery: string;
    createdAt: string;
}

export function TitleCard({ userQuery, createdAt }: TitleCardProps) {
    return (
        <div className="shadow-xl rounded-2xl p-8 w-200 flex justify-center items-center flex-col gap-4 bg-white mt-4">
            <h1 className="font-bold text-2xl">{userQuery}</h1>
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