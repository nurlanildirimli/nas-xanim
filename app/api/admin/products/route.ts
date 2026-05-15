import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { adminErrorResponse } from "@/lib/admin/http";
import { productInputSchema } from "@/lib/admin/schemas";
import { serializeProduct } from "@/lib/admin/serializers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products: products.map(serializeProduct) });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const input = productInputSchema.parse(await request.json());

    const product = await prisma.product.create({
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

    return NextResponse.json({ product: serializeProduct(product) }, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
