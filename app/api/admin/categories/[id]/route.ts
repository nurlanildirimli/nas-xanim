import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { adminErrorResponse } from "@/lib/admin/http";
import { categoryInputSchema, normalizeOptionalUrl } from "@/lib/admin/schemas";
import { serializeCategory } from "@/lib/admin/serializers";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const input = categoryInputSchema.parse(await request.json());

    const category = await prisma.category.update({
      where: { id },
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

    return NextResponse.json({ category: serializeCategory(category) });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/");

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2003") {
      return NextResponse.json(
        { error: "Category has products and cannot be deleted." },
        { status: 409 },
      );
    }

    return adminErrorResponse(error);
  }
}
