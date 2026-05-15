import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const authHeaderSchema = z.string().startsWith("Bearer ");

export async function POST(request: NextRequest) {
  const parsedHeader = authHeaderSchema.safeParse(request.headers.get("authorization"));

  if (!parsedHeader.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await requireUser(request);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
