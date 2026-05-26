export type RestaurantMainCard = {
    info: {
        id: string;
        name: string;
        locality: string;
        areaName: string;
        costForTwoMessage: string;
        cuisines: string[];
        avgRatingString: string;
        totalRatingsString: string;
        sla: {
            slaString: string
        }
    }
}