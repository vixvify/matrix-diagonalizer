import {
  cleanNumber,
  determinant,
  EPSILON,
  identity,
  inverse,
  nullSpace,
  scale,
  subtract,
} from "./matrix-operations";
import type { DiagonalizationResult, EigenValue, Matrix } from "./types";

type Root = {
  value: number;
  multiplicity: number;
};

export function characteristicPolynomial(matrix: Matrix): {
  coefficients: number[];
  display: string;
} {
  if (matrix.length === 2) {
    const trace = matrix[0][0] + matrix[1][1];
    const det = determinant(matrix);
    const coefficients = [1, -trace, det].map(cleanNumber);

    return {
      coefficients,
      display: polynomialToText(coefficients),
    };
  }

  const trace = matrix[0][0] + matrix[1][1] + matrix[2][2];
  const secondCoefficient =
    matrix[0][0] * matrix[1][1] +
    matrix[0][0] * matrix[2][2] +
    matrix[1][1] * matrix[2][2] -
    matrix[0][1] * matrix[1][0] -
    matrix[0][2] * matrix[2][0] -
    matrix[1][2] * matrix[2][1];
  const det = determinant(matrix);
  const coefficients = [1, -trace, secondCoefficient, -det].map(cleanNumber);

  return {
    coefficients,
    display: polynomialToText(coefficients),
  };
}

export function analyzeEigenvalues(matrix: Matrix): EigenValue[] {
  const { coefficients } = characteristicPolynomial(matrix);
  const roots = matrix.length === 2 ? quadraticRoots(coefficients) : cubicRoots(coefficients);

  return roots.map((root) => {
    const shifted = subtract(matrix, scale(identity(matrix.length), root.value));
    const eigenvectors = nullSpace(shifted);

    return {
      value: cleanNumber(root.value),
      algebraicMultiplicity: root.multiplicity,
      geometricMultiplicity: eigenvectors.length,
      eigenvectors,
    };
  });
}

export function diagonalize(matrix: Matrix, eigenvalues: EigenValue[]): DiagonalizationResult {
  const size = matrix.length;
  const basis = eigenvalues.flatMap((item) => item.eigenvectors);

  if (basis.length !== size) {
    return {
      canDiagonalize: false,
      reason:
        "จำนวนเวกเตอร์ลักษณะเฉพาะอิสระเชิงเส้นไม่ครบ n ตัว จึงสร้างฐานสำหรับ R^n ไม่ได้",
    };
  }

  const p = rowsToColumns(basis);
  const pInverse = inverse(p);

  if (!pInverse) {
    return {
      canDiagonalize: false,
      reason: "เมทริกซ์ P ที่สร้างจาก eigenvectors ไม่ผกผัน แปลว่าเวกเตอร์ยังไม่อิสระเชิงเส้น",
    };
  }

  const diagonalValues = eigenvalues.flatMap((item) =>
    Array.from({ length: item.eigenvectors.length }, () => item.value),
  );

  return {
    canDiagonalize: true,
    reason: "พบ eigenvectors อิสระเชิงเส้นครบ n ตัว จึงแปลงเป็นเมทริกซ์ทแยงมุมได้",
    p,
    pInverse,
    d: diagonalValues.map((value, row) =>
      diagonalValues.map((_, col) => (row === col ? value : 0)),
    ),
  };
}

function quadraticRoots([a, b, c]: number[]): Root[] {
  const discriminant = b * b - 4 * a * c;

  if (discriminant < -EPSILON) {
    return [];
  }

  if (Math.abs(discriminant) <= EPSILON) {
    return [{ value: -b / (2 * a), multiplicity: 2 }];
  }

  const sqrt = Math.sqrt(discriminant);

  return clusterRoots([
    { value: (-b + sqrt) / (2 * a), multiplicity: 1 },
    { value: (-b - sqrt) / (2 * a), multiplicity: 1 },
  ]);
}

function cubicRoots([a0, b0, c0, d0]: number[]): Root[] {
  const a = b0 / a0;
  const b = c0 / a0;
  const c = d0 / a0;
  const p = b - (a * a) / 3;
  const q = (2 * a * a * a) / 27 - (a * b) / 3 + c;
  const discriminant = (q / 2) ** 2 + (p / 3) ** 3;

  if (Math.abs(discriminant) <= EPSILON) {
    const u = cubeRoot(-q / 2);
    if (Math.abs(u) <= EPSILON) {
      return [{ value: cleanNumber(-a / 3), multiplicity: 3 }];
    }

    return clusterRoots([
      { value: 2 * u - a / 3, multiplicity: 1 },
      { value: -u - a / 3, multiplicity: 2 },
    ]);
  }

  if (discriminant > 0) {
    const sqrt = Math.sqrt(discriminant);
    const u = cubeRoot(-q / 2 + sqrt);
    const v = cubeRoot(-q / 2 - sqrt);

    return [{ value: cleanNumber(u + v - a / 3), multiplicity: 1 }];
  }

  const angle = Math.acos((3 * q * Math.sqrt(-3 / p)) / (2 * p));
  const radius = 2 * Math.sqrt(-p / 3);

  return clusterRoots(
    [0, 1, 2].map((index) => ({
      value: radius * Math.cos((angle - 2 * Math.PI * index) / 3) - a / 3,
      multiplicity: 1,
    })),
  );
}

function clusterRoots(roots: Root[]): Root[] {
  return roots
    .map((root) => ({ ...root, value: cleanNumber(root.value) }))
    .sort((a, b) => a.value - b.value)
    .reduce<Root[]>((result, root) => {
      const existing = result.find((item) => Math.abs(item.value - root.value) < 1e-6);

      if (existing) {
        existing.multiplicity += root.multiplicity;
      } else {
        result.push(root);
      }

      return result;
    }, []);
}

function cubeRoot(value: number): number {
  return value < 0 ? -Math.cbrt(Math.abs(value)) : Math.cbrt(value);
}

function rowsToColumns(rows: number[][]): Matrix {
  return rows[0].map((_, col) => rows.map((row) => row[col]));
}

function polynomialToText(coefficients: number[]): string {
  const degree = coefficients.length - 1;
  const terms = coefficients
    .map((coefficient, index) => {
      const power = degree - index;
      const value = cleanNumber(coefficient);

      if (value === 0) {
        return "";
      }

      const abs = Math.abs(value);
      const variable = power === 0 ? "" : power === 1 ? "lambda" : `lambda^${power}`;
      const number = abs === 1 && power > 0 ? "" : formatValue(abs);
      const sign = value < 0 ? "-" : "+";

      return `${sign} ${number}${variable}`;
    })
    .filter(Boolean);

  return `${terms.join(" ").replace(/^\+ /, "")} = 0`;
}

export function formatValue(value: number): string {
  const cleaned = cleanNumber(value);

  if (Number.isInteger(cleaned)) {
    return cleaned.toString();
  }

  return cleaned.toFixed(4).replace(/\.?0+$/, "");
}
