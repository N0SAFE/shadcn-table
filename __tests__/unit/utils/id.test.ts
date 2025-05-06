import { describe, it, expect } from "vitest";
import { generateId } from "../../../src/utils/id";

describe("generateId", () => {
  it("generates an id with default options", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBe(12);
  });

  it("generates an id with a prefix", () => {
    const id = generateId("task");
    expect(id.startsWith("tsk_")).toBe(true);
    expect(id.length).toBeGreaterThan(4);
  });

  it("generates an id with custom length and separator", () => {
    const id = generateId({ length: 6, separator: "-" });
    expect(id.length).toBe(6);
  });

  it("generates an id with prefix and custom options", () => {
    const id = generateId("task", { length: 8, separator: ":" });
    expect(id.startsWith("tsk:"));
    expect(id.length).toBeGreaterThan(4);
  });
});
