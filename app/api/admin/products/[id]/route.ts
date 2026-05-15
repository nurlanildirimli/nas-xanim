import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { adminErrorResponse } from "@/lib/admin/http";
import { productInputSchema } from "@/lib/admin/schemas";
import { serializeProduct } from "@/lib/admin/serializers";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getUploadthingKeyFromUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const fileMarkerIndex = url.pathname.split("/").findIndex((part) => part === "f");

    if (fileMarkerIndex === -1) {
      return null;
    }

    const key = url.pathname.split("/")[fileMarkerIndex + 1];
    return key ? decodeURIComponent(key) : null;
  } catch {
    return null;
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const input = productInputSchema.parse(await request.json());
    const existing = await prisma.product.findUnique({ where: { id }, select: { slug: true } });

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        price: input.price.toFixed(2),
        categoryId: input.categoryId,
        images: input.images,
        sizes: input.sizes,
        colors: input.colors,
        colorHex: input.colorHex,
        stock: input.stock,
        isNew: input.isNew,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    revalidatePath("/");
    revalidatePath(`/products/${product.slug}`);
    if (existing?.slug && existing.slug !== product.slug) {
      revalidatePath(`/products/${existing.slug}`);
    }

    return NextResponse.json({ product: serializeProduct(product) });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const product = await prisma.product.delete({
      where: { id },
      select: {
        slug: true,
        images: true,
      },
    });
    const uploadthingKeys = Array.from(
      new Set(
        product.images
          .map((image: string) => getUploadthingKeyFromUrl(image))
          .filter((key: string | null): key is string => Boolean(key)),
      ),
    );
    let cleanupWarning: string | null = null;

    if (uploadthingKeys.length > 0) {
      try {
        await new UTApi().deleteFiles(uploadthingKeys);
      } catch {
        cleanupWarning = "Product was deleted, but some Uploadthing files could not be removed.";
      }
    }

    revalidatePath("/");
    revalidatePath(`/products/${product.slug}`);

    return NextResponse.json({ ok: true, warning: cleanupWarning });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
