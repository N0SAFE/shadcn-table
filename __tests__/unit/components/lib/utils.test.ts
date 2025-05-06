import { describe, it, expect } from "vitest";
import { cn, formatDate, toSentenceCase, composeEventHandlers } from "../../../../src/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toContain("a");
    expect(cn("a", false, "b")).toContain("b");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    expect(formatDate("2020-01-01")).toMatch(/January|2020/);
  });
  it("formats a Date object", () => {
    expect(formatDate(new Date("2020-01-01"))).toMatch(/January|2020/);
  });
});

describe("toSentenceCase", () => {
  it("converts to sentence case", () => {
    expect(toSentenceCase("helloWorld")).toBe("Hello world");
    expect(toSentenceCase("snake_case")) .toBe("Snake case");
  });
});

describe("composeEventHandlers", () => {
  it("calls both handlers if not prevented", () => {
    let called = false;
    const orig = () => {};
    const ours = () => { called = true; };
    const handler = composeEventHandlers(orig, ours);
    handler({} as any);
    expect(called).toBe(true);
  });
});
