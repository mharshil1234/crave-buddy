import type { RestaurantCandidate } from "@/socket/types";

/** restaurantId -> recommended menu item ids. This is the shape stored in mood_boards.mood_board. */
export type BoardRecommendation = Record<string, string[]>;

export interface BoardRequest {
    query: string;
    isVeg: boolean;
    lat: string;
    lng: string;
}

export interface GroupRequest {
    cravings: string[];
    candidates: RestaurantCandidate[];
}

export interface GroupNomination {
    restaurantId: string;
    matchReason: string;
}

/**
 * A recommendation provider. Output is untrusted: callers must validate it
 * against the catalogue (see ./validate.ts and validateGroupNominations).
 */
export interface Recommender {
    readonly name: string;
    recommendBoard(request: BoardRequest): Promise<BoardRecommendation>;
    nominateForGroup(request: GroupRequest): Promise<GroupNomination[]>;
}
