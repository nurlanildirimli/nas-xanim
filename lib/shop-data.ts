import { cache } from "react";
import { prisma } from "@/lib/db";
import type { CategorySummary, ProductSummary } from "@/types";

const fallbackCategoryImage =
  "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=900&auto=format&fit=crop";
const fallbackProductImage =
  "https://images.unsplash.com/photo-1618354691551-44de113f0164?q=80&w=1200&auto=format&fit=crop";

type ProductWithCategory = Awaited<ReturnType<typeof getProductsFromDb>>[number];
export type ProductSort = "newest" | "price-asc" | "price-desc" | "name-asc";
type ProductWhereInput = {
  category?: {
    slug: string;
  };
  sizes?: {
    hasSome: string[];
  };
  colors?: {
    hasSome: string[];
  };
  price?: {
    gte?: number;
    lte?: number;
  };
};
type ProductOrderBy = Array<Record<string, "asc" | "desc">>;

export type ProductListingParams = {
  category?: string;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
};

export type ProductFilterOptions = {
  categories: CategorySummary[];
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
};

async function getProductsFromDb() {
  return prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ isNew: "desc" }, { createdAt: "asc" }],
  });
}

function toProductSummary(product: ProductWithCategory): ProductSummary {
  const image = product.images[0] ?? fallbackProductImage;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price.toNumber(),
    image,
    gallery: product.images.length > 0 ? product.images : [image],
    category: product.category.name,
    sizes: product.sizes,
    colors: product.colors,
    colorHex: product.colorHex,
    stock: product.stock,
    isNew: product.isNew,
  };
}

export const getHomeCategories = cache(async (): Promise<CategorySummary[]> => {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image ?? fallbackCategoryImage,
    productCount: category._count.products,
  }));
});

export const getNewArrivalProducts = cache(async (): Promise<ProductSummary[]> => {
  const products = await getProductsFromDb();
  return products.map(toProductSummary);
});

export const getProductBySlug = cache(async (slug: string): Promise<ProductSummary | null> => {
  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  return product ? toProductSummary(product) : null;
});

export const getProductSlugs = cache(async (): Promise<Array<{ slug: string }>> => {
  return prisma.product.findMany({
    select: {
      slug: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
});

function getProductOrderBy(sort: ProductSort | undefined): ProductOrderBy {
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "name-asc":
      return [{ name: "asc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

export const getProductListing = cache(async (params: ProductListingParams): Promise<ProductSummary[]> => {
  const where: ProductWhereInput = {};

  if (params.category) {
    where.category = {
      slug: params.category,
    };
  }

  if (params.sizes?.length) {
    where.sizes = {
      hasSome: params.sizes,
    };
  }

  if (params.colors?.length) {
    where.colors = {
      hasSome: params.colors,
    };
  }

  if (typeof params.minPrice === "number" || typeof params.maxPrice === "number") {
    where.price = {
      ...(typeof params.minPrice === "number" ? { gte: params.minPrice } : {}),
      ...(typeof params.maxPrice === "number" ? { lte: params.maxPrice } : {}),
    };
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: getProductOrderBy(params.sort),
  });

  return products.map(toProductSummary);
});

export const getProductFilterOptions = cache(async (): Promise<ProductFilterOptions> => {
  const [categories, products] = await Promise.all([
    getHomeCategories(),
    prisma.product.findMany({
      select: {
        sizes: true,
        colors: true,
        price: true,
      },
    }),
  ]);

  const prices = products.map((product) => product.price.toNumber());

  return {
    categories,
    sizes: Array.from(new Set(products.flatMap((product) => product.sizes))).sort(),
    colors: Array.from(new Set(products.flatMap((product) => product.colors))).sort(),
    minPrice: prices.length ? Math.floor(Math.min(...prices)) : 0,
    maxPrice: prices.length ? Math.ceil(Math.max(...prices)) : 0,
  };
});
