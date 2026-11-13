export type RangeCondition = {
  operator?: string;
  value?: number | string;
  gate?: string;
};

function compareValues(
  left: number | string | undefined,
  operator: string | undefined,
  right: number | string | undefined
): boolean {
  if (left === undefined || left === null || right === undefined || right === null) {
    return false;
  }

  const leftNum = Number(left);
  const rightNum = Number(right);
  const useNumeric = !Number.isNaN(leftNum) && !Number.isNaN(rightNum);
  const a = useNumeric ? leftNum : String(left);
  const b = useNumeric ? rightNum : String(right);

  switch (operator) {
    case ">":
      return a > b;
    case "<":
      return a < b;
    case ">=":
      return a >= b;
    case "<=":
      return a <= b;
    case "==":
      // eslint-disable-next-line eqeqeq
      return a == b;
    case "===":
      return left === right || a === b;
    case "!=":
      // eslint-disable-next-line eqeqeq
      return a != b;
    case "!==":
      return a !== b;
    default:
      return false;
  }
}

/**
 * Safely evaluates structured range conditions without using dynamic code execution (`eval`).
 * Respects standard boolean precedence (`&&` binds tighter than `||`).
 */
export function evaluateRangeExpression(
  currentValue: number | string | undefined,
  rawConditions: unknown
): boolean {
  let conditions: unknown = rawConditions;
  if (typeof rawConditions === "string") {
    try {
      conditions = JSON.parse(rawConditions);
    } catch {
      return false;
    }
  }

  if (!Array.isArray(conditions) || conditions.length === 0) {
    return false;
  }

  let orResult = false;
  let andAccumulator = true;

  for (let i = 0; i < conditions.length; i++) {
    const cond = (conditions[i] ?? {}) as RangeCondition;
    const matches = compareValues(currentValue, cond.operator, cond.value);
    andAccumulator = andAccumulator && matches;

    if (i < conditions.length - 1) {
      const gate = String(cond.gate ?? "&&").trim();
      if (gate === "||") {
        orResult = orResult || andAccumulator;
        if (orResult) {
          return true;
        }
        andAccumulator = true;
      }
    }
  }

  return orResult || andAccumulator;
}

