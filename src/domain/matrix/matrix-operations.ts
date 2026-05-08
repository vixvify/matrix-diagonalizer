import type { Matrix } from "./types";

export const EPSILON = 1e-8;

export function identity(size: number): Matrix {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => (row === col ? 1 : 0)),
  );
}

export function subtract(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((value, j) => value - b[i][j]));
}

export function scale(matrix: Matrix, scalar: number): Matrix {
  return matrix.map((row) => row.map((value) => value * scalar));
}

export function determinant(matrix: Matrix): number {
  if (matrix.length === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }

  const [a, b, c] = matrix[0];
  const [d, e, f] = matrix[1];
  const [g, h, i] = matrix[2];

  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

export function inverse(matrix: Matrix): Matrix | null {
  const size = matrix.length;
  const augmented = matrix.map((row, index) => [...row, ...identity(size)[index]]);
  const reduced = rref(augmented);

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (Math.abs(reduced[row][col] - (row === col ? 1 : 0)) > 1e-6) {
        return null;
      }
    }
  }

  return reduced.map((row) => row.slice(size));
}

export function rref(matrix: Matrix): Matrix {
  const result = matrix.map((row) => [...row]);
  const rowCount = result.length;
  const colCount = result[0].length;
  let lead = 0;

  for (let row = 0; row < rowCount && lead < colCount; row += 1) {
    let pivot = row;

    while (pivot < rowCount && Math.abs(result[pivot][lead]) < EPSILON) {
      pivot += 1;
    }

    if (pivot === rowCount) {
      lead += 1;
      row -= 1;
      continue;
    }

    [result[row], result[pivot]] = [result[pivot], result[row]];

    const pivotValue = result[row][lead];
    result[row] = result[row].map((value) => value / pivotValue);

    for (let other = 0; other < rowCount; other += 1) {
      if (other === row) {
        continue;
      }

      const factor = result[other][lead];
      result[other] = result[other].map(
        (value, col) => value - factor * result[row][col],
      );
    }

    lead += 1;
  }

  return result.map((row) => row.map(cleanNumber));
}

export function nullSpace(matrix: Matrix): number[][] {
  const reduced = rref(matrix);
  const colCount = matrix[0].length;
  const pivotColumns: number[] = [];

  reduced.forEach((row) => {
    const pivot = row.findIndex((value) => Math.abs(value) > EPSILON);
    if (pivot >= 0) {
      pivotColumns.push(pivot);
    }
  });

  const freeColumns = Array.from({ length: colCount }, (_, index) => index).filter(
    (col) => !pivotColumns.includes(col),
  );

  return freeColumns.map((freeCol) => {
    const vector = Array.from({ length: colCount }, () => 0);
    vector[freeCol] = 1;

    pivotColumns.forEach((pivotCol, rowIndex) => {
      vector[pivotCol] = -reduced[rowIndex][freeCol];
    });

    return normalizeVector(vector.map(cleanNumber));
  });
}

export function cleanNumber(value: number): number {
  if (Math.abs(value) < EPSILON) {
    return 0;
  }

  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < EPSILON) {
    return rounded;
  }

  return value;
}

function normalizeVector(vector: number[]): number[] {
  const firstNonZero = vector.find((value) => Math.abs(value) > EPSILON);
  if (!firstNonZero) {
    return vector;
  }

  return vector.map((value) => cleanNumber(value / firstNonZero));
}
