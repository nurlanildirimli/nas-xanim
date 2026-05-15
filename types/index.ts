export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  gallery?: string[];
  category: string;
  sizes: string[];
  colors: string[];
  colorHex?: string[];
  stock: number;
  isNew?: boolean;
};

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
};
