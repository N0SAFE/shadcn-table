import { describe, it, expect, vi } from "vitest";
import { importFromCSV } from "../../../src/utils/import";

describe("importFromCSV", () => {
  it("parses valid CSV and calls onSuccess", async () => {
    const file = new File(["title,code\nfoo,bar"], "test.csv", { type: "text/csv" });
    const onSuccess = vi.fn();
    const result = await importFromCSV(file, onSuccess);
    expect(result.success).toBe(true);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("returns error for invalid CSV", async () => {
    const file = new File(["title\n"], "test.csv", { type: "text/csv" });
    const result = await importFromCSV(file);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/CSV file must contain/);
  });
});
