import type { Order, OrderItem, Product, User } from "@prisma/client";

type OrderWithDetails = Order & {
  user: Pick<User, "email" | "name">;
  items: Array<
    OrderItem & {
      product: Pick<Product, "name" | "slug" | "images">;
    }
  >;
};

export function serializeOrder(order: OrderWithDetails) {
  return {
    id: order.id,
    status: order.status,
    total: order.total.toNumber(),
    createdAt: order.createdAt.toISOString(),
    customerName: order.customerName,
    phone: order.phone,
    addressLine: order.addressLine,
    city: order.city,
    postalCode: order.postalCode ?? "",
    note: order.note ?? "",
    userEmail: order.user.email,
    userName: order.user.name ?? "",
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productSlug: item.product.slug,
      productImage: item.product.images[0] ?? "",
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.price.toNumber(),
    })),
  };
}

export type SerializedOrder = ReturnType<typeof serializeOrder>;
