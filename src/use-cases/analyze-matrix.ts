import {
  analyzeEigenvalues,
  characteristicPolynomial,
  diagonalize,
} from "@/domain/matrix/eigen-analysis";
import type { Matrix, MatrixAnalysis } from "@/domain/matrix/types";

export function analyzeMatrix(matrix: Matrix): MatrixAnalysis {
  const size = matrix.length;

  // use-case นี้รองรับเฉพาะเมทริกซ์ 2x2 และ 3x3 ตามขอบเขตของโปรแกรม
  if (size !== 2 && size !== 3) {
    throw new Error("รองรับเฉพาะเมทริกซ์ขนาด 2x2 หรือ 3x3");
  }

  // คำนวณสมการลักษณะเฉพาะ det(lambda I - A) เพื่อใช้หารากที่เป็น eigenvalues
  // จากนั้นเอาแต่ละ eigenvalue ไปหา eigenvectors ต่อใน analyzeEigenvalues()
  const characteristic = characteristicPolynomial(matrix);
  const eigenvalues = analyzeEigenvalues(matrix);

  // รวม algebraicMultiplicity เพื่อดูว่ามีรากจริงครบ n ค่าไหม
  // ถ้าไม่ครบ แปลว่ายังมีรากเชิงซ้อน โปรแกรมนี้จึงไม่พยายาม diagonalize ต่อในระบบจำนวนจริง
  if (eigenvalues.reduce((sum, item) => sum + item.algebraicMultiplicity, 0) !== size) {
    return {
      size,
      input: matrix,
      characteristicPolynomial: characteristic.display,
      eigenvalues,
      diagonalization: {
        canDiagonalize: false,
        reason:
          "สมการลักษณะเฉพาะมีรากจริงไม่ครบ n ค่า โปรแกรมนี้จึงสรุปว่าไม่สามารถแปลงเป็นเมทริกซ์ทแยงมุมเหนือจำนวนจริงได้",
      },
    };
  }

  return {
    size,
    input: matrix,
    characteristicPolynomial: characteristic.display,
    eigenvalues,
    // ถ้ามีรากจริงครบแล้ว ให้ตรวจต่อว่า eigenvectors อิสระเชิงเส้นครบพอสร้าง P ได้หรือไม่
    diagonalization: diagonalize(matrix, eigenvalues),
  };
}
