import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeOrder } from "@/lib/orders/serializers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders: orders.map(serializeOrder) });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Orders could not be loaded." }, { status: 500 });
  }
}
