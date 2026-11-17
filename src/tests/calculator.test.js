const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { describe, it } = require("node:test");
const { calculate, modulo, power, squareRoot } = require("../calculator.js");

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

  it("calculates modulo remainders", () => {
    assert.equal(modulo(5, 2), 1);
    assert.equal(modulo(10, 4), 2);
    assert.equal(modulo(-10, 4), -2);
    assert.equal(calculate("%", 5, 2), 1);
    assert.equal(calculate("%", 10, 4), 2);
    assert.equal(calculate("modulo", 10, 4), 2);
    assert.throws(() => modulo(10, 0), /modulo by zero/);
    assert.throws(() => modulo(10, -0), /modulo by zero/);
  });

  it("raises a base to an exponent", () => {
    assert.equal(power(2, 3), 8);
    assert.equal(power(5, 0), 1);
    assert.equal(power(2, -2), 0.25);
    assert.equal(calculate("^", 2, 3), 8);
    assert.equal(calculate("power", 2, 3), 8);
  });

  it("calculates square roots and rejects negative values", () => {
    assert.equal(squareRoot(0), 0);
    assert.equal(squareRoot(16), 4);
    assert.equal(squareRoot(81), 9);
    assert.equal(squareRoot(2), Math.sqrt(2));
    assert.equal(calculate("sqrt", 16), 4);
    assert.equal(calculate("sqrt", 81), 9);
    assert.equal(calculate("square-root", 81), 9);
    assert.throws(() => squareRoot(-1), /square root of a negative number/);
    assert.throws(() => calculate("sqrt", -1), /square root of a negative number/);
  });

  it("rejects unsupported operations", () => {
    assert.throws(() => calculate("~", 5, 2), /Unsupported operation/);
    assert.throws(() => calculate("toString", 5, 2), /Unsupported operation/);
    assert.throws(() => calculate(null, 5, 2), /Operation must be/);
  });

  it("requires the correct number of operands for each operation", () => {
    assert.throws(() => calculate("+", 1), /requires exactly 2 operands/);
    assert.throws(() => calculate("sqrt", 9, 1), /requires exactly 1 operand/);
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

  it("runs modulo, exponentiation, and square root operations", () => {
    const examples = [
      [["%", "5", "2"], "1"],
      [["^", "2", "3"], "8"],
      [["sqrt", "16"], "4"],
    ];

    for (const [arguments_, expected] of examples) {
      const result = spawnSync(process.execPath, [calculatorPath, ...arguments_], {
        encoding: "utf8",
      });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout, `${expected}\n`);
      assert.equal(result.stderr, "");
    }

    const negativeSquareRoot = spawnSync(
      process.execPath,
      [calculatorPath, "sqrt", "-1"],
      { encoding: "utf8" },
    );
    assert.equal(negativeSquareRoot.status, 1);
    assert.match(negativeSquareRoot.stderr, /square root of a negative number/);

    const moduloByZero = spawnSync(
      process.execPath,
      [calculatorPath, "%", "5", "0"],
      { encoding: "utf8" },
    );
    assert.equal(moduloByZero.status, 1);
    assert.match(moduloByZero.stderr, /modulo by zero/);
  });
});
