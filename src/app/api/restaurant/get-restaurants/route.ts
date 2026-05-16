export async function GET() {

    const response = await fetch(
        "https://www.swiggy.com/dapi/restaurants/list/v5?lat=12.97530&lng=77.59100&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING",
        {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0",
            },
            cache: "no-store",
        }
    );

    const data = await response.json();

    return Response.json(data);
}