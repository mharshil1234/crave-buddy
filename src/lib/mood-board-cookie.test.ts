import { describe, expect, it } from "vitest";
import { appendGeneratedMoodBoard, readGeneratedMoodBoards } from "./mood-board-cookie";

describe("readGeneratedMoodBoards", () => {
    it("parses a list of ids", () => {
        expect(readGeneratedMoodBoards('["a","b"]')).toEqual(["a", "b"]);
    });

    it("returns [] for missing or malformed values", () => {
        for (const value of [undefined, "", "{not json", '{"a":1}', "42"]) expect(readGeneratedMoodBoards(value)).toEqual([]);
        expect(readGeneratedMoodBoards('["a",1,null]')).toEqual(["a"]);
    });
});

describe("appendGeneratedMoodBoard", () => {
    it("appends and keeps the 20 most recent", () => {
        const many = JSON.stringify(Array.from({ length: 20 }, (_, i) => `id${i}`));
        const result = JSON.parse(appendGeneratedMoodBoard(many, "new"));
        expect(result).toHaveLength(20);
        expect(result.at(-1)).toBe("new");
        expect(result[0]).toBe("id1");
        expect(JSON.parse(appendGeneratedMoodBoard("garbage", "x"))).toEqual(["x"]);
    });
});
