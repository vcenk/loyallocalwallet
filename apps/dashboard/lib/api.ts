import { NextResponse } from "next/server";

// Standard API error shape (docs/api-spec.md §14).
export function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function apiOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
