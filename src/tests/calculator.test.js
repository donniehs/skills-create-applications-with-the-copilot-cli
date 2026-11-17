const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { describe, it } = require("node:test");
const { calculate } = require("../calculator.js");

const calculatorPath = path.resolve(__dirname, "..", "calculator.js");

describe("calculate", () => {
  it("performs the four examples shown in the basic-operations image", () => {
    assert.equal(calculate("+", 2, 3), 5);
    assert.equal(calculate("-", 10, 4), 6);
    assert.equal(calculate("*", 45, 2), 90);
    assert.equal(calculate("/", 20, 5), 4);
  });

  it("supports operation names as aliases for symbols", () => {
    assert.equal(calculate("addition", 2, 3), 5);
    assert.equal(calculate("subtract", 10, 4), 6);
    assert.equal(calculate("MULTIPLICATION", 45, 2), 90);
    assert.equal(calculate("Divide", 20, 5), 4);
  });

  it("handles decimal and negative operands", () => {
    assert.equal(calculate("+", -2.5, 1), -1.5);
    assert.equal(calculate("-", -2, -3), 1);
    assert.equal(calculate("*", -2.5, 2), -5);
    assert.equal(calculate("/", -7.5, 2.5), -3);
  });

  it("rejects unsupported operations", () => {
    assert.throws(() => calculate("%", 5, 2), /Unsupported operation/);
    assert.throws(() => calculate("toString", 5, 2), /Unsupported operation/);
    assert.throws(() => calculate(null, 5, 2), /Operation must be/);
  });

  it("rejects non-finite operands", () => {
    assert.throws(() => calculate("+", Number.NaN, 1), /finite numbers/);
    assert.throws(() => calculate("*", 1, Number.POSITIVE_INFINITY), /finite numbers/);
    assert.throws(() => calculate("/", "20", 5), /finite numbers/);
  });

  it("reports division by zero for positive and negative zero", () => {
    assert.throws(() => calculate("/", 20, 0), /Cannot divide by zero/);
    assert.throws(() => calculate("/", 20, -0), /Cannot divide by zero/);
  });
});

describe("calculator CLI", () => {
  it("prints the results for the four image examples", () => {
    const examples = [
      ["+", "2", "3", "5"],
      ["-", "10", "4", "6"],
      ["*", "45", "2", "90"],
      ["/", "20", "5", "4"],
    ];

    for (const [operation, left, right, expected] of examples) {
      const result = spawnSync(
        process.execPath,
        [calculatorPath, operation, left, right],
        { encoding: "utf8" },
      );
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout, `${expected}\n`);
      assert.equal(result.stderr, "");
    }
  });

  it("shows usage and exits unsuccessfully when arguments are missing", () => {
    const result = spawnSync(process.execPath, [calculatorPath], {
      encoding: "utf8",
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Usage: node src\/calculator\.js/);
    assert.equal(result.stdout, "");
  });

  it("reports invalid numbers and division by zero", () => {
    const invalidNumber = spawnSync(
      process.execPath,
      [calculatorPath, "+", "nope", "2"],
      { encoding: "utf8" },
    );
    assert.equal(invalidNumber.status, 1);
    assert.match(invalidNumber.stderr, /finite number/);

    const divisionByZero = spawnSync(
      process.execPath,
      [calculatorPath, "/", "1", "0"],
      { encoding: "utf8" },
    );
    assert.equal(divisionByZero.status, 1);
    assert.match(divisionByZero.stderr, /Cannot divide by zero/);
  });
});
