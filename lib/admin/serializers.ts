import type { Category, Product } from "@prisma/client";

export function serializeCategory(category: Category & { _count?: { products: number } }) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image ?? "",
    productCount: category._count?.products ?? 0,
    createdAt: category.createdAt.toISOString(),
  };
}

export function serializeProduct(product: Product & { category: { name: string } }) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price.toNumber(),
    images: product.images,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    sizes: product.sizes,
    colors: product.colors,
    colorHex: product.colorHex,
    stock: product.stock,
    isNew: product.isNew,
    createdAt: product.createdAt.toISOString(),
  };
}
