function assertFiniteNumber(value, label) {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
}

function modulo(a, b) {
  assertFiniteNumber(a, "Dividend");
  assertFiniteNumber(b, "Divisor");
  if (b === 0) {
    throw new Error("Cannot calculate modulo by zero.");
  }
  return a % b;
}

function power(base, exponent) {
  assertFiniteNumber(base, "Base");
  assertFiniteNumber(exponent, "Exponent");
  return base ** exponent;
}

function squareRoot(n) {
  assertFiniteNumber(n, "Operand");
  if (n < 0) {
    throw new Error("Cannot calculate the square root of a negative number.");
  }
  return Math.sqrt(n);
}

// Supported operations: addition (+), subtraction (-), multiplication (*), division (/),
// modulo (%), exponentiation (^), and square root (sqrt).
const operations = {
  "+": (left, right) => left + right,
  "-": (left, right) => left - right,
  "*": (left, right) => left * right,
  "/": (left, right) => {
    if (right === 0) {
      throw new Error("Cannot divide by zero.");
    }
    return left / right;
  },
  "%": modulo,
  "^": power,
  sqrt: squareRoot,
};

const operationAliases = {
  add: "+",
  addition: "+",
  subtract: "-",
  subtraction: "-",
  multiply: "*",
  multiplication: "*",
  divide: "/",
  division: "/",
  mod: "%",
  modulo: "%",
  pow: "^",
  power: "^",
  squareroot: "sqrt",
  "square-root": "sqrt",
};

const usage = [
  "Usage: node src/calculator.js <operation> <number> [number]",
  "Binary operations: +, -, *, /, %, ^ (or addition, subtraction, multiplication, division, modulo, power)",
  "Unary operation: sqrt <number>",
].join("\n");

function calculate(operation, ...operands) {
  if (typeof operation !== "string") {
    throw new Error("Operation must be a supported operation.");
  }

  const normalizedOperation = operation.toLowerCase();
  const symbol = Object.hasOwn(operationAliases, normalizedOperation)
    ? operationAliases[normalizedOperation]
    : operation;
  if (!Object.hasOwn(operations, symbol)) {
    throw new Error(`Unsupported operation "${operation}".`);
  }

  const expectedOperands = symbol === "sqrt" ? 1 : 2;
  if (operands.length !== expectedOperands) {
    throw new Error(
      `Operation "${operation}" requires exactly ${expectedOperands} operand${expectedOperands === 1 ? "" : "s"}.`,
    );
  }
  if (!operands.every(Number.isFinite)) {
    throw new Error("Operands must be finite numbers.");
  }

  return operations[symbol](...operands);
}

function parseNumber(value, label) {
  if (value.trim() === "") {
    throw new Error(`${label} must be a number.`);
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${label} must be a finite number.`);
  }
  return number;
}

function main(args) {
  if (args.length < 2) {
    console.error(usage);
    process.exitCode = 1;
    return;
  }

  try {
    const [operation, ...values] = args;
    const operands = values.map((value, index) =>
      parseNumber(value, `Operand ${index + 1}`),
    );
    const result = calculate(operation, ...operands);
    console.log(result);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { calculate, modulo, power, squareRoot };
