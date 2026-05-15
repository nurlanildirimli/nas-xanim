import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminErrorResponse } from "@/lib/admin/http";
import { prisma } from "@/lib/db";
import { serializeOrder } from "@/lib/orders/serializers";

const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const input = orderStatusSchema.parse(await request.json());

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: input.status,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
