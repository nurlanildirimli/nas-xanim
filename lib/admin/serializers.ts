type DecimalLike = {
  toNumber(): number;
};

type AdminCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  createdAt: Date;
  _count?: {
    products: number;
  };
};

type AdminProductRecord = {
  id: string;
  name: string;
  slug: string;
  price: DecimalLike;
  images: string[];
  categoryId: string;
  category: {
    name: string;
  };
  sizes: string[];
  colors: string[];
  colorHex: string[];
  stock: number;
  isNew: boolean;
  createdAt: Date;
};

export function serializeCategory(category: AdminCategoryRecord) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image ?? "",
    productCount: category._count?.products ?? 0,
    createdAt: category.createdAt.toISOString(),
  };
}

export function serializeProduct(product: AdminProductRecord) {
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
