import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ message: "Hello, world!", status: "ok" });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}