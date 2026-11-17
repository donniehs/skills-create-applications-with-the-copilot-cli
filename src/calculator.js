// Supported operations: addition (+), subtraction (-), multiplication (*), and division (/).
const operations = {
  "+": (left, right) => left + right,
  "-": (left, right) => left - right,
  "*": (left, right) => left * right,
  "/": (left, right) => left / right,
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
};

const usage = [
  "Usage: node src/calculator.js <operation> <number> <number>",
  "Operations: + (addition), - (subtraction), * (multiplication), / (division)",
].join("\n");

function calculate(operation, left, right) {
  if (typeof operation !== "string") {
    throw new Error("Operation must be +, -, *, or /.");
  }
  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    throw new Error("Both operands must be finite numbers.");
  }

  const normalizedOperation = operation.toLowerCase();
  const symbol = Object.hasOwn(operationAliases, normalizedOperation)
    ? operationAliases[normalizedOperation]
    : operation;
  if (!Object.hasOwn(operations, symbol)) {
    throw new Error(`Unsupported operation "${operation}". Use +, -, *, or /.`);
  }
  if (symbol === "/" && right === 0) {
    throw new Error("Cannot divide by zero.");
  }

  return operations[symbol](left, right);
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
  if (args.length !== 3) {
    console.error(usage);
    process.exitCode = 1;
    return;
  }

  try {
    const [operation, firstValue, secondValue] = args;
    const result = calculate(
      operation,
      parseNumber(firstValue, "First operand"),
      parseNumber(secondValue, "Second operand"),
    );
    console.log(result);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { calculate };
