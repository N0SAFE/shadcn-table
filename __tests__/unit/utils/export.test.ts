import { describe, it, expect, vi } from "vitest";
import { exportTableToCSV } from "../../../src/utils/export";

describe("exportTableToCSV", () => {
  it("should create a CSV and trigger download", () => {
    const mockTable = {
      getAllLeafColumns: () => [{ id: "a" }, { id: "b" }],
      getRowModel: () => ({ rows: [
        { getValue: (k: string) => k === "a" ? "foo" : "bar" },
      ] }),
      getFilteredSelectedRowModel: () => ({ rows: [] }),
    };
    const createObjectURL = vi.fn(() => "blob:url");
    const appendChild = vi.fn();
    const removeChild = vi.fn();
    const click = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    global.document.createElement = () => ({ setAttribute: vi.fn(), style: {}, click } as any);
    global.document.body.appendChild = appendChild;
    global.document.body.removeChild = removeChild;
    exportTableToCSV(mockTable as any, { filename: "test" });
    expect(createObjectURL).toHaveBeenCalled();
    expect(appendChild).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
  });
});
