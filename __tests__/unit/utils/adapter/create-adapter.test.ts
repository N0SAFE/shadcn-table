import { createAdapter, createFilterTypeDef } from "../../../../src/utils/adapter/create-adapter";
import { describe, it, expect } from "vitest";

// Dummy types for testing
type DummyOperator = { value: string; label: string };
type DummyProps = { foo: string };

const dummyOperators = [
  { value: "eq", label: "Equals" },
  { value: "ne", label: "Not Equals" },
];

describe("createFilterTypeDef", () => {
  it("should create a filter type definition with correct properties", () => {
    const def = createFilterTypeDef<DummyProps, DummyOperator>(
      dummyOperators,
      {
        defaultOperator: "eq",
        defaultValue: { foo: "bar" },
        showInputForEmptyOperators: true,
        props: (props) => props,
      },
      ({ props, selectedOperator }) => null
    );
    expect(def.operators).toEqual(dummyOperators);
    expect(def.defaultOperator).toBe("eq");
    expect(def.defaultValue).toEqual({ foo: "bar" });
    expect(def.showInputForEmptyOperators).toBe(true);
    expect(typeof def.component).toBe("function");
  });
});

describe("createAdapter", () => {
  const filterTypeDef = createFilterTypeDef<DummyProps, DummyOperator>(
    dummyOperators,
    {
      defaultOperator: "eq",
      defaultValue: { foo: "bar" },
      showInputForEmptyOperators: false,
      props: (props) => props,
    },
    ({ props, selectedOperator }) => null
  );
  const adapterValue = { text: filterTypeDef };
  const adapter = createAdapter(adapterValue);

  it("should return the correct filter type definition for a valid type", () => {
    expect(adapter.getFilterTypeDef("text")).toBe(filterTypeDef);
  });

  it("should throw an error for an invalid type", () => {
    // @ts-expect-error
    expect(() => adapter.getFilterTypeDef("invalid")).toThrow(
      'Filter type "invalid" not found in adapter'
    );
  });

  it("should expose the value property", () => {
    expect(adapter.value).toBe(adapterValue);
  });
});
