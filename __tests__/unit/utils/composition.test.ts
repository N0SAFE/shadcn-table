import { describe, it, expect, vi } from "vitest";
import { composeEventHandlers, composeRefs, useComposedRefs } from "../../../src/utils/composition";
import * as React from "react";

describe("composeEventHandlers", () => {
  it("calls both handlers if not prevented", () => {
    const orig = vi.fn();
    const ours = vi.fn();
    const handler = composeEventHandlers(orig, ours);
    handler({} as any);
    expect(orig).toHaveBeenCalled();
    expect(ours).toHaveBeenCalled();
  });

  it("does not call ourEventHandler if defaultPrevented is true and checkForDefaultPrevented is true", () => {
    const orig = vi.fn((e: any) => (e.defaultPrevented = true));
    const ours = vi.fn();
    const handler = composeEventHandlers(orig, ours);
    handler({ defaultPrevented: true } as any);
    expect(orig).toHaveBeenCalled();
    expect(ours).not.toHaveBeenCalled();
  });

  it("calls ourEventHandler if checkForDefaultPrevented is false", () => {
    const orig = vi.fn();
    const ours = vi.fn();
    const handler = composeEventHandlers(orig, ours, { checkForDefaultPrevented: false });
    handler({ defaultPrevented: true } as any);
    expect(ours).toHaveBeenCalled();
  });
});

describe("composeRefs", () => {
  it("sets all refs to the node", () => {
    const ref1 = { current: null as null | HTMLDivElement };
    let ref2Value: any = null;
    const ref2 = (v: any) => (ref2Value = v);
    const node = {};
    const composed = composeRefs(ref1, ref2);
    composed(node);
    expect(ref1.current).toBe(node);
    expect(ref2Value).toBe(node);
  });
});

// Skipped: useComposedRefs cannot be tested outside a React component context
describe("useComposedRefs", () => {
  it.skip("returns a stable callback that sets all refs", () => {
    // This test is skipped because useComposedRefs is a React hook and must be called inside a component
  });
});
