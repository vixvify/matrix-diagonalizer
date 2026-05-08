"use client";

import { useMemo, useState } from "react";
import { formatValue } from "@/domain/matrix/eigen-analysis";
import type { Matrix, MatrixAnalysis } from "@/domain/matrix/types";
import { analyzeMatrix } from "@/use-cases/analyze-matrix";

const examples: Record<2 | 3, Matrix> = {
  2: [
    [4, 1],
    [2, 3],
  ],
  3: [
    [2, 0, 0],
    [0, 3, 4],
    [0, 4, 9],
  ],
};

export function EigenMatrixCalculator() {
  const [size, setSize] = useState<2 | 3>(2);
  const [values, setValues] = useState<string[][]>(toInputValues(examples[2]));

  const matrix = useMemo(() => parseMatrix(values), [values]);
  const analysis = useMemo(() => {
    if (!matrix) {
      return null;
    }

    return analyzeMatrix(matrix);
  }, [matrix]);

  function changeSize(nextSize: 2 | 3) {
    setSize(nextSize);
    setValues(toInputValues(examples[nextSize]));
  }

  function updateCell(row: number, col: number, value: string) {
    setValues((current) =>
      current.map((items, rowIndex) =>
        rowIndex === row
          ? items.map((item, colIndex) => (colIndex === col ? value : item))
          : items,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950 pt-20">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-zinc-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Assignment #2 CSS114
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">
              Eigen Matrix Diagonalizer
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              กรอกเมทริกซ์ 2x2 หรือ 3x3 เพื่อหา eigen value, eigen vector
              และตรวจว่าแปลงเป็นเมทริกซ์ทแยงมุมได้หรือไม่
            </p>
          </div>
          <div className="inline-flex w-fit rounded-md border border-zinc-300 bg-white p-1 shadow-sm">
            {[2, 3].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => changeSize(item as 2 | 3)}
                className={`h-10 min-w-20 rounded px-4 text-sm font-medium transition ${
                  size === item
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {item}x{item}
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.3fr)]">
          <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Matrix A</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  ใส่ตัวเลขจริงได้ทั้งจำนวนเต็มและทศนิยม
                </p>
              </div>
              <button
                type="button"
                onClick={() => setValues(toInputValues(examples[size]))}
                className="h-9 rounded-md border border-zinc-300 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                ตัวอย่าง
              </button>
            </div>

            <div
              className="mt-5 grid gap-3"
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            >
              {values.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <label key={`${rowIndex}-${colIndex}`} className="block">
                    <span className="sr-only">
                      row {rowIndex + 1} column {colIndex + 1}
                    </span>
                    <input
                      value={value}
                      onChange={(event) =>
                        updateCell(rowIndex, colIndex, event.target.value)
                      }
                      inputMode="decimal"
                      className="h-14 w-full rounded-md border border-zinc-300 bg-zinc-50 text-center font-mono text-lg outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>
                )),
              )}
            </div>

            {!matrix ? (
              <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                กรุณากรอกตัวเลขให้ครบทุกช่องก่อนคำนวณ
              </p>
            ) : null}
          </section>

          <ResultPanel analysis={analysis} />
        </div>
      </section>
    </main>
  );
}

function ResultPanel({ analysis }: { analysis: MatrixAnalysis | null }) {
  if (!analysis) {
    return (
      <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">ผลลัพธ์</h2>
        <p className="mt-3 text-sm text-zinc-500">รอข้อมูลเมทริกซ์ที่ครบถ้วน</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">ผลลัพธ์</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoBlock
            label="Characteristic equation"
            value={analysis.characteristicPolynomial}
          />
          <InfoBlock
            label="Diagonalizable"
            value={analysis.diagonalization.canDiagonalize ? "ได้" : "ไม่ได้"}
            tone={
              analysis.diagonalization.canDiagonalize ? "success" : "danger"
            }
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold">
            Eigen values และ Eigen vectors
          </h3>
          <div className="mt-4 space-y-3">
            {analysis.eigenvalues.map((item) => (
              <div
                key={item.value}
                className="rounded-md border border-zinc-200 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-lg font-semibold">
                    lambda = {formatValue(item.value)}
                  </span>
                  <span className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                    AM {item.algebraicMultiplicity}
                  </span>
                  <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                    GM {item.geometricMultiplicity}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {item.eigenvectors.map((vector, index) => (
                    <p key={index} className="font-mono text-sm text-zinc-700">
                      v{index + 1} = [{vector.map(formatValue).join(", ")}]
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold">
            สรุปการแปลงเป็นเมทริกซ์ทแยงมุม
          </h3>
          <p className="mt-3 rounded-md bg-zinc-50 px-3 py-2 text-sm leading-6 text-zinc-700">
            {analysis.diagonalization.reason}
          </p>

          {analysis.diagonalization.canDiagonalize ? (
            <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <MatrixView title="P" matrix={analysis.diagonalization.p} />
              <MatrixView title="D" matrix={analysis.diagonalization.d} />
              <MatrixView
                title="P^-1"
                matrix={analysis.diagonalization.pInverse}
              />
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}

function InfoBlock({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-700"
      : tone === "danger"
        ? "text-rose-700"
        : "text-zinc-950";

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">
        {label}
      </p>
      <p className={`mt-2 font-mono text-base font-semibold ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

function MatrixView({ title, matrix }: { title: string; matrix: Matrix }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-zinc-700">{title}</p>
      <div className="w-full overflow-x-auto rounded-md border border-zinc-200">
        <table className="w-full border-collapse bg-white font-mono text-sm">
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((value, colIndex) => (
                  <td
                    key={colIndex}
                    className="border border-zinc-200 px-3 py-2 text-center"
                  >
                    {formatValue(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function toInputValues(matrix: Matrix): string[][] {
  return matrix.map((row) => row.map(String));
}

function parseMatrix(values: string[][]): Matrix | null {
  const parsed = values.map((row) =>
    row.map((value) => {
      const number = Number(value);
      return value.trim() === "" || Number.isNaN(number) ? null : number;
    }),
  );

  if (parsed.some((row) => row.some((value) => value === null))) {
    return null;
  }

  return parsed as Matrix;
}
