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
  // จำนวนครั้งที่รากนี้ซ้ำใน characteristic polynomial
  multiplicity: number;
};

// สร้าง characteristic polynomial ของเมทริกซ์ เพื่อใช้หารากที่เป็น eigenvalues
export function characteristicPolynomial(matrix: Matrix): {
  coefficients: number[];
  display: string;
} {
  if (matrix.length === 2) {
    // สำหรับ 2x2 ใช้สูตร lambda^2 - trace(A)lambda + det(A)
    const trace = matrix[0][0] + matrix[1][1];
    const det = determinant(matrix);
    const coefficients = [1, -trace, det].map(cleanNumber);

    return {
      coefficients,
      display: polynomialToText(coefficients),
    };
  }

  // สำหรับ 3x3 polynomial จะอยู่ในรูป lambda^3 - trace(A)lambda^2 + c2 lambda - det(A)
  const trace = matrix[0][0] + matrix[1][1] + matrix[2][2];

  // c2 คือผลรวมของ principal minors ขนาด 2x2:
  // a11a22 + a11a33 + a22a33 - a12a21 - a13a31 - a23a32
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

// หา eigenvalues จากรากของ polynomial แล้วหา eigenvectors จาก null space ของ A - lambda I
export function analyzeEigenvalues(matrix: Matrix): EigenValue[] {
  const { coefficients } = characteristicPolynomial(matrix);
  const roots = matrix.length === 2 ? quadraticRoots(coefficients) : cubicRoots(coefficients);

  return roots.map((root) => {
    // eigenvector ของ lambda คือคำตอบไม่ศูนย์ของ (A - lambda I)v = 0
    // ดังนั้น nullSpace(shifted) จะให้ basis ของ eigenspace นั้น
    const shifted = subtract(matrix, scale(identity(matrix.length), root.value));
    const eigenvectors = nullSpace(shifted);

    return {
      value: cleanNumber(root.value),
      algebraicMultiplicity: root.multiplicity,
      // geometricMultiplicity คือจำนวน eigenvectors อิสระที่หาได้จาก null space
      geometricMultiplicity: eigenvectors.length,
      eigenvectors,
    };
  });
}

// ตรวจว่า eigenvectors รวมกันเป็นฐานของ R^n ได้ไหม ถ้าได้จะสร้าง P, D และ P^-1
export function diagonalize(matrix: Matrix, eigenvalues: EigenValue[]): DiagonalizationResult {
  const size = matrix.length;
  const basis = eigenvalues.flatMap((item) => item.eigenvectors);

  // ต้องมี eigenvectors อิสระเชิงเส้นครบเท่ากับขนาดเมทริกซ์ จึง diagonalize ได้
  if (basis.length !== size) {
    return {
      canDiagonalize: false,
      reason:
        "จำนวนเวกเตอร์ลักษณะเฉพาะอิสระเชิงเส้นไม่ครบ n ตัว จึงสร้างฐานสำหรับ R^n ไม่ได้",
    };
  }

  // วาง eigenvectors เป็นคอลัมน์ของ P แล้วหา inverse เพื่อใช้ใน A = PDP^-1
  const p = rowsToColumns(basis);
  const pInverse = inverse(p);

  // กันกรณีตัวเลขคลาดเคลื่อนหรือ vectors ที่ได้ไม่อิสระจริง ทำให้ P หา inverse ไม่ได้
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
    // D เป็นเมทริกซ์ทแยงมุมที่ใส่ eigenvalue ให้ตรงกับลำดับคอลัมน์ของ eigenvector ใน P
    d: diagonalValues.map((value, row) =>
      diagonalValues.map((_, col) => (row === col ? value : 0)),
    ),
  };
}

function quadraticRoots([a, b, c]: number[]): Root[] {
  // ใช้ discriminant แยกกรณีรากจริง 0, 1 ซ้ำ, หรือ 2 ค่า
  const discriminant = b * b - 4 * a * c;

  // discriminant ติดลบมากพอ แปลว่าไม่มีรากจริง จึงคืน [] ให้ชั้นบนรู้ว่ารากจริงไม่ครบ
  if (discriminant < -EPSILON) {
    return [];
  }

  // discriminant ใกล้ศูนย์ถือว่าเป็นรากซ้ำ 2 ครั้ง
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
  // แปลง cubic เป็น depressed cubic แล้วใช้ discriminant แยกจำนวนรากจริง
  const a = b0 / a0;
  const b = c0 / a0;
  const c = d0 / a0;
  const p = b - (a * a) / 3;
  const q = (2 * a * a * a) / 27 - (a * b) / 3 + c;
  const discriminant = (q / 2) ** 2 + (p / 3) ** 3;

  // discriminant ใกล้ศูนย์คือมีรากซ้ำ จึงต้องรวม multiplicity ให้ถูก
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

  // discriminant บวกจะมีรากจริงเพียง 1 ค่า อีก 2 ค่าเป็นจำนวนเชิงซ้อน
  if (discriminant > 0) {
    const sqrt = Math.sqrt(discriminant);
    const u = cubeRoot(-q / 2 + sqrt);
    const v = cubeRoot(-q / 2 - sqrt);

    return [{ value: cleanNumber(u + v - a / 3), multiplicity: 1 }];
  }

  // discriminant ลบจะมีรากจริง 3 ค่า ใช้สูตรตรีโกณมิติช่วยหลีกเลี่ยง complex number
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
  // รวมรากที่ใกล้กันมากให้เป็นค่าเดียว แล้วเพิ่ม multiplicity เพื่อกัน error จากเลขทศนิยม
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
  // แปลง list ของ eigenvectors ให้กลายเป็นเมทริกซ์ที่แต่ละ vector อยู่เป็นคอลัมน์
  return rows[0].map((_, col) => rows.map((row) => row[col]));
}

function polynomialToText(coefficients: number[]): string {
  // แปลง coefficients เป็นข้อความสมการสำหรับแสดงผล
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
