# Eigen Matrix Diagonalizer

เว็บแอปสำหรับคำนวณ eigenvalue, eigenvector และตรวจว่าเมทริกซ์สามารถแปลงเป็นเมทริกซ์ทแยงมุมได้หรือไม่ รองรับเมทริกซ์ขนาด 2x2 และ 3x3

โปรเจกต์นี้ทำด้วย Next.js, React, TypeScript และ Tailwind CSS โดยแยก logic การคำนวณออกจากหน้า UI เพื่อให้อ่านและแก้ไขได้ง่าย

## Features

- เลือกขนาดเมทริกซ์ 2x2 หรือ 3x3
- กรอกค่าจำนวนจริงได้ทั้งจำนวนเต็มและทศนิยม
- แสดง characteristic equation
- หา eigenvalues พร้อม algebraic multiplicity
- หา eigenvectors และ geometric multiplicity
- ตรวจเงื่อนไขการ diagonalize
- แสดงเมทริกซ์ `P`, `D` และ `P^-1` เมื่อ diagonalize ได้
- แจ้งเหตุผลเมื่อไม่สามารถ diagonalize ได้ในระบบจำนวนจริง

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint

## Getting Started

ติดตั้ง dependencies:

```bash
npm install
```

รัน development server:

```bash
npm run dev
```

เปิดเว็บที่:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
```

รันโปรเจกต์ในโหมด development

```bash
npm run build
```

build โปรเจกต์สำหรับ production

```bash
npm run start
```

รัน production build

```bash
npm run lint
```

ตรวจโค้ดด้วย ESLint

## Project Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    eigen-matrix-calculator.tsx
  domain/
    matrix/
      eigen-analysis.ts
      matrix-operations.ts
      types.ts
  use-cases/
    analyze-matrix.ts
```

## Main Files

`src/components/eigen-matrix-calculator.tsx`

หน้า calculator หลัก ใช้เก็บ state ของ input, แปลงค่าจากช่องกรอกเป็น matrix และส่งข้อมูลไปคำนวณ

`src/use-cases/analyze-matrix.ts`

เป็น use-case กลางของระบบ รับ matrix เข้ามาแล้วรวมผลลัพธ์ทั้งหมด ได้แก่ characteristic polynomial, eigenvalues และ diagonalization result

`src/domain/matrix/eigen-analysis.ts`

เก็บ logic หลักของ eigen analysis เช่น การสร้าง characteristic polynomial, หารากของสมการ, หา eigenvectors และสร้าง `P`, `D`, `P^-1`

`src/domain/matrix/matrix-operations.ts`

เก็บ operation พื้นฐานของ matrix เช่น determinant, inverse, RREF, null space และการจัดการ error จาก floating point

`src/domain/matrix/types.ts`

เก็บ type ของ matrix, eigenvalue และผลลัพธ์การ diagonalize

## Calculation Flow

1. ผู้ใช้กรอกค่า matrix ในหน้า calculator
2. โปรแกรมแปลงค่าจาก string เป็น number matrix
3. `analyzeMatrix()` ตรวจว่าขนาด matrix เป็น 2x2 หรือ 3x3
4. สร้าง characteristic polynomial
5. หารากของ polynomial เพื่อหา eigenvalues
6. ใช้ `(A - lambda I)v = 0` เพื่อหา eigenvectors จาก null space
7. ตรวจว่ามี eigenvectors อิสระเชิงเส้นครบตามมิติ matrix หรือไม่
8. ถ้าครบ จะสร้าง `P`, `D`, `P^-1`
9. ถ้าไม่ครบ จะแสดงเหตุผลว่า diagonalize ไม่ได้

## Notes

- โปรแกรมนี้โฟกัสการคำนวณบนจำนวนจริง
- ถ้า characteristic polynomial มีรากจริงไม่ครบตามขนาด matrix ระบบจะสรุปว่าไม่สามารถ diagonalize ในระบบจำนวนจริงได้
- ค่า floating point ที่ใกล้ศูนย์หรือใกล้จำนวนเต็มจะถูกปรับด้วย `cleanNumber()` เพื่อให้ผลลัพธ์อ่านง่ายขึ้น
