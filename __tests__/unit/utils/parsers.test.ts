import { describe, it, expect } from "vitest";
import { getSortingStateParser, getFiltersStateParser, createArrayFiltersSchemaWithJoin } from "../../../src/utils/parsers";

describe("getSortingStateParser", () => {
  it("parses valid sorting state", () => {
    const parser = getSortingStateParser();
    const value = JSON.stringify([{ id: "foo", desc: true }]);
    expect(parser.parse(value)).toEqual([{ id: "foo", desc: true }]);
  });

  it("returns null for invalid JSON", () => {
    const parser = getSortingStateParser();
    expect(parser.parse("not-json")).toBeNull();
  });
});

describe("getFiltersStateParser", () => {
  it("parses valid filters state", () => {
    const parser = getFiltersStateParser();
    const value = JSON.stringify([
      { id: "foo", value: "bar", type: "text", operator: "eq", rowId: "1" },
    ]);
    expect(parser.parse(value)).toEqual([
      { id: "foo", value: "bar", type: "text", operator: "eq", rowId: "1" },
    ]);
  });

  it("returns null for invalid JSON", () => {
    const parser = getFiltersStateParser();
    expect(parser.parse("not-json")).toBeNull();
  });
});

describe("createArrayFiltersSchemaWithJoin", () => {
  it("validates correct structure", () => {
    const schema = createArrayFiltersSchemaWithJoin();
    const result = schema.safeParse({
      filters: [
        { id: "foo", value: "bar", type: "text", operator: "eq", rowId: "1" },
      ],
      joinOperator: "and",
    });
    expect(result.success).toBe(true);
  });
});
