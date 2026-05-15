import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { adminErrorResponse } from "@/lib/admin/http";
import { categoryInputSchema, normalizeOptionalUrl } from "@/lib/admin/schemas";
import { serializeCategory } from "@/lib/admin/serializers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ categories: categories.map(serializeCategory) });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const input = categoryInputSchema.parse(await request.json());
    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        image: normalizeOptionalUrl(input.image),
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    revalidatePath("/");

    return NextResponse.json({ category: serializeCategory(category) }, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
