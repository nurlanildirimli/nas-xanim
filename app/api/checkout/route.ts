import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, AuthError } from "@/lib/auth";
import { prisma } from "@/lib/db";

const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  size: z.string().trim().min(1),
  color: z.string().trim().min(1),
});

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  addressLine: z.string().trim().min(5),
  city: z.string().trim().min(2),
  postalCode: z.string().trim().optional().or(z.literal("")),
  note: z.string().trim().optional().or(z.literal("")),
  items: z.array(checkoutItemSchema).min(1),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;
type CheckoutItem = CheckoutInput["items"][number];
type CheckoutProduct = {
  id: string;
  price: {
    toNumber(): number;
  };
  stock: number;
  name: string;
};

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const input = checkoutSchema.parse(await request.json());
    const productIds = Array.from(new Set(input.items.map((item: CheckoutItem) => item.productId)));

    const products: CheckoutProduct[] = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        price: true,
        stock: true,
        name: true,
      },
    });
    const productMap = new Map<string, CheckoutProduct>(
      products.map((product: CheckoutProduct) => [product.id, product]),
    );

    for (const item of input.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return NextResponse.json({ error: "Product not found." }, { status: 400 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `${product.name} üçün stok kifayət deyil.` },
          { status: 409 },
        );
      }
    }

    const total = input.items.reduce((sum: number, item: CheckoutItem) => {
      const product = productMap.get(item.productId);
      return sum + (product?.price.toNumber() ?? 0) * item.quantity;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
      for (const item of input.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error("INSUFFICIENT_STOCK");
        }
      }

      return tx.order.create({
        data: {
          userId: user.id,
          customerName: input.customerName,
          phone: input.phone,
          addressLine: input.addressLine,
          city: input.city,
          postalCode: input.postalCode || null,
          note: input.note || null,
          total: total.toFixed(2),
          items: {
            create: input.items.map((item: CheckoutItem) => {
              const product = productMap.get(item.productId);

              return {
                productId: item.productId,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: product?.price.toNumber().toFixed(2) ?? "0.00",
              };
            }),
          },
        },
        select: {
          id: true,
          total: true,
        },
      });
    });

    return NextResponse.json({
      orderId: order.id,
      total: Number(order.total),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid checkout payload.", issues: error.issues }, { status: 400 });
    }

    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json({ error: "Stok kifayət deyil." }, { status: 409 });
    }

    return NextResponse.json({ error: "Checkout failed." }, { status: 500 });
  }
}
