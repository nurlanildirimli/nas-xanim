import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminErrorResponse } from "@/lib/admin/http";
import { prisma } from "@/lib/db";
import { serializeOrder } from "@/lib/orders/serializers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const orders = await prisma.order.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders: orders.map(serializeOrder) });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
