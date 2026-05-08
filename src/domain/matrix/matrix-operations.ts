import type { Matrix } from "./types";

// ใช้เป็นค่าความคลาดเคลื่อนเวลาตรวจเลขทศนิยมที่ควรถือว่าเป็นศูนย์
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
  // determinant ใช้สูตรตรงสำหรับ 2x2 และ 3x3 เพราะโปรแกรมรองรับแค่สองขนาดนี้
  if (matrix.length === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }

  const [a, b, c] = matrix[0];
  const [d, e, f] = matrix[1];
  const [g, h, i] = matrix[2];

  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

export function inverse(matrix: Matrix): Matrix | null {
  // หา inverse ด้วยการต่อ [A | I] แล้วทำ RREF ถ้าฝั่งซ้ายไม่เป็น I แปลว่า inverse ไม่มี
  const size = matrix.length;
  const augmented = matrix.map((row, index) => [...row, ...identity(size)[index]]);
  const reduced = rref(augmented);

  // หลังลดรูปแล้ว matrix ที่มี inverse ควรได้ [I | A^-1]
  // วนตรวจฝั่งซ้ายก่อน ถ้าไม่ใช่ identity ก็คืน null
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
  // ทำ Gaussian elimination จนได้ reduced row echelon form
  const result = matrix.map((row) => [...row]);
  const rowCount = result.length;
  const colCount = result[0].length;
  let lead = 0;

  for (let row = 0; row < rowCount && lead < colCount; row += 1) {
    let pivot = row;

    // หาแถวที่มีค่า pivot ในคอลัมน์ lead ถ้าค่าน้อยกว่า EPSILON จะถือว่าเป็นศูนย์
    while (pivot < rowCount && Math.abs(result[pivot][lead]) < EPSILON) {
      pivot += 1;
    }

    // ถ้าคอลัมน์นี้ไม่มี pivot ให้ขยับไปคอลัมน์ถัดไปและลองแถวเดิมใหม่
    if (pivot === rowCount) {
      lead += 1;
      row -= 1;
      continue;
    }

    // สลับแถว pivot ขึ้นมาอยู่ตำแหน่งปัจจุบัน แล้วหารทั้งแถวให้ pivot มีค่าเป็น 1
    [result[row], result[pivot]] = [result[pivot], result[row]];

    const pivotValue = result[row][lead];
    result[row] = result[row].map((value) => value / pivotValue);

    // ใช้แถว pivot ลบค่าในคอลัมน์เดียวกันของแถวอื่นให้เป็น 0 ทั้งหมด
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
  // หา basis ของ null space โดยดู pivot/free columns จาก RREF
  const reduced = rref(matrix);
  const colCount = matrix[0].length;
  const pivotColumns: number[] = [];

  // pivot column คือตัวแปรที่ถูกกำหนดจากสมการ ส่วน column ที่เหลือเป็น free variable
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
    // ให้ free variable ตัวหนึ่งเป็น 1 แล้วคำนวณค่า pivot variables ย้อนจาก RREF
    // แต่ละ free column จะสร้าง basis vector หนึ่งตัวของ null space
    const vector = Array.from({ length: colCount }, () => 0);
    vector[freeCol] = 1;

    pivotColumns.forEach((pivotCol, rowIndex) => {
      vector[pivotCol] = -reduced[rowIndex][freeCol];
    });

    return normalizeVector(vector.map(cleanNumber));
  });
}

export function cleanNumber(value: number): number {
  // ลด noise จาก floating point เช่น 1.00000000001 ให้กลับเป็น 1
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
  // ปรับ vector ให้ตัวแรกที่ไม่ใช่ศูนย์มีค่าเป็น 1 เพื่อให้อ่านง่ายและเทียบผลได้ง่าย
  const firstNonZero = vector.find((value) => Math.abs(value) > EPSILON);
  if (!firstNonZero) {
    return vector;
  }

  return vector.map((value) => cleanNumber(value / firstNonZero));
}
