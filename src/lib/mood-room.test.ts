import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/catalogue", () => ({}));
vi.mock("@/lib/recommender", () => ({ getRecommender: vi.fn() }));

import { validateGroupNominations } from "./mood-room";

const candidate = (restaurantId: string) => ({
    restaurantId, name: restaurantId, image: "", cuisines: [], rating: 4, deliveryTime: "30 mins", costForTwo: "₹300",
});
const candidates = ["r1", "r2", "r3", "r4", "r5"].map(candidate);
const nominate = (...ids: string[]) => ids.map((restaurantId) => ({ restaurantId, matchReason: "fits" }));

describe("validateGroupNominations", () => {
    it("returns candidates with match reasons", () => {
        const result = validateGroupNominations(nominate("r1", "r2", "r3"), candidates);
        expect(result.map((r) => r.restaurantId)).toEqual(["r1", "r2", "r3"]);
        expect(result[0]).toMatchObject({ name: "r1", matchReason: "fits" });
    });

    it("rejects duplicates", () => {
        expect(() => validateGroupNominations(nominate("r1", "r1", "r2"), candidates)).toThrow(/unique/);
    });

    it("rejects restaurants outside the candidate list", () => {
        expect(() => validateGroupNominations(nominate("r1", "r2", "nope"), candidates)).toThrow(/outside/);
    });

    it("requires 3 to 4 nominees", () => {
        expect(() => validateGroupNominations(nominate("r1", "r2"), candidates)).toThrow();
        expect(() => validateGroupNominations(nominate("r1", "r2", "r3", "r4", "r5"), candidates)).toThrow();
    });
});
