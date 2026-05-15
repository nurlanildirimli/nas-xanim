import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth";

export function adminErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Invalid input", issues: error.issues }, { status: 400 });
  }

  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
    return NextResponse.json({ error: "A record with this unique value already exists." }, { status: 409 });
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
