import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "./safe-redirect";

describe("safeCallbackUrl", () => {
    it("keeps same-site relative paths", () => {
        expect(safeCallbackUrl("/cart")).toBe("/cart");
        expect(safeCallbackUrl("/mood-room/abc?x=1#y")).toBe("/mood-room/abc?x=1#y");
    });

    it("falls back to / for anything else", () => {
        for (const value of [null, undefined, "", "cart", "https://evil.example", "//evil.example", "/\\evil.example", "/\nfoo", "javascript:alert(1)"]) {
            expect(safeCallbackUrl(value)).toBe("/");
        }
    });
});
