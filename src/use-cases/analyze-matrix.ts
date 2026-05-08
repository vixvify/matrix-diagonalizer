import {
  analyzeEigenvalues,
  characteristicPolynomial,
  diagonalize,
} from "@/domain/matrix/eigen-analysis";
import type { Matrix, MatrixAnalysis } from "@/domain/matrix/types";

export function analyzeMatrix(matrix: Matrix): MatrixAnalysis {
  const size = matrix.length;

  if (size !== 2 && size !== 3) {
    throw new Error("รองรับเฉพาะเมทริกซ์ขนาด 2x2 หรือ 3x3");
  }

  const characteristic = characteristicPolynomial(matrix);
  const eigenvalues = analyzeEigenvalues(matrix);

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
    diagonalization: diagonalize(matrix, eigenvalues),
  };
}
