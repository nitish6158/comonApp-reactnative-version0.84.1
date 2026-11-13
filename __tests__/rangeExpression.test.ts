import { evaluateRangeExpression } from "../src/utils/rangeExpression";

describe("evaluateRangeExpression", () => {
  it("evaluates single numeric comparisons", () => {
    expect(evaluateRangeExpression(10, [{ operator: ">", value: 5 }])).toBe(true);
    expect(evaluateRangeExpression(3, [{ operator: ">", value: 5 }])).toBe(false);
    expect(evaluateRangeExpression(5, [{ operator: ">=", value: 5 }])).toBe(true);
    expect(evaluateRangeExpression(4, [{ operator: "<", value: 5 }])).toBe(true);
    expect(evaluateRangeExpression(5, [{ operator: "<=", value: 5 }])).toBe(true);
    expect(evaluateRangeExpression(5, [{ operator: "==", value: "5" }])).toBe(true);
    expect(evaluateRangeExpression(5, [{ operator: "===", value: 5 }])).toBe(true);
    expect(evaluateRangeExpression(5, [{ operator: "!=", value: 4 }])).toBe(true);
    expect(evaluateRangeExpression(5, [{ operator: "!==", value: 4 }])).toBe(true);
  });

  it("parses JSON string condition arrays and respects && / || precedence", () => {
    const jsonExpr = JSON.stringify([
      { operator: ">", value: 10, gate: "&&" },
      { operator: "<", value: 20, gate: "||" },
      { operator: "==", value: 99 },
    ]);
    expect(evaluateRangeExpression(15, jsonExpr)).toBe(true);
    expect(evaluateRangeExpression(25, jsonExpr)).toBe(false);
    expect(evaluateRangeExpression(99, jsonExpr)).toBe(true);
  });

  it("handles invalid inputs safely without throwing", () => {
    expect(evaluateRangeExpression(undefined, [{ operator: ">", value: 1 }])).toBe(false);
    expect(evaluateRangeExpression(5, "{invalid-json")).toBe(false);
    expect(evaluateRangeExpression(5, [])).toBe(false);
    expect(evaluateRangeExpression(5, [{ operator: "invalid", value: 5 }])).toBe(false);
  });
});

