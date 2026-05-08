export type Matrix = number[][];

// เก็บข้อมูลของ eigenvalue แต่ละค่า:
// algebraicMultiplicity คือจำนวนซ้ำของรากใน polynomial
// geometricMultiplicity คือจำนวน eigenvectors อิสระที่หาได้จาก null space
export type EigenValue = {
  value: number;
  algebraicMultiplicity: number;
  geometricMultiplicity: number;
  eigenvectors: number[][];
};

// ผลลัพธ์การ diagonalize แยกเป็นกรณีสำเร็จและไม่สำเร็จ
// ถ้าสำเร็จจะมี P, D และ P^-1 สำหรับความสัมพันธ์ A = PDP^-1
// ถ้าไม่สำเร็จจะมี reason ไว้อธิบายว่าขาดเงื่อนไขอะไร
export type DiagonalizationResult =
  | {
      canDiagonalize: true;
      reason: string;
      p: Matrix;
      pInverse: Matrix;
      d: Matrix;
    }
  | {
      canDiagonalize: false;
      reason: string;
    };

// โครงสร้างผลวิเคราะห์ทั้งหมดที่ UI ใช้แสดงผล ตั้งแต่ polynomial, eigenvalues จนถึงผล diagonalization
export type MatrixAnalysis = {
  size: 2 | 3;
  input: Matrix;
  characteristicPolynomial: string;
  eigenvalues: EigenValue[];
  diagonalization: DiagonalizationResult;
};
