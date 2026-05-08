export type Matrix = number[][];

export type EigenValue = {
  value: number;
  algebraicMultiplicity: number;
  geometricMultiplicity: number;
  eigenvectors: number[][];
};

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

export type MatrixAnalysis = {
  size: 2 | 3;
  input: Matrix;
  characteristicPolynomial: string;
  eigenvalues: EigenValue[];
  diagonalization: DiagonalizationResult;
};
