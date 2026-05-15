import type { CategorySummary, ProductSummary } from "@/types";

export const categories: CategorySummary[] = [
  {
    id: "bras",
    name: "Sütyenlər",
    slug: "sutyenler",
    image: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=900&auto=format&fit=crop",
    productCount: 18,
  },
  {
    id: "bottoms",
    name: "Alt geyimlər",
    slug: "alt-geyimler",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=900&auto=format&fit=crop",
    productCount: 16,
  },
  {
    id: "sets",
    name: "Dəstlər",
    slug: "destler",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=900&auto=format&fit=crop",
    productCount: 12,
  },
  {
    id: "corsets",
    name: "Korsetlər",
    slug: "korsetler",
    image: "https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?q=80&w=900&auto=format&fit=crop",
    productCount: 7,
  },
  {
    id: "nightwear",
    name: "Pijamalar",
    slug: "pijamalar",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=900&auto=format&fit=crop",
    productCount: 9,
  },
  {
    id: "accessories",
    name: "Aksesuarlar",
    slug: "aksesuarlar",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=900&auto=format&fit=crop",
    productCount: 11,
  },
];

export const products: ProductSummary[] = [
  {
    id: "delicate-lace-set",
    name: "Zərif Dantelli Dəst",
    slug: "zerif-dantelli-dest",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1618354691551-44de113f0164?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1618354691551-44de113f0164?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200&auto=format&fit=crop",
    ],
    category: "Dəstlər",
    sizes: ["70B", "75B", "80B", "85B"],
    colors: ["Burqundi", "Qara", "Pudra"],
    colorHex: ["#7a1026", "#111111", "#eec9cc"],
    stock: 14,
    isNew: true,
  },
  {
    id: "silk-touch-bralette",
    name: "İpək Toxunuşlu Bralet",
    slug: "ipek-toxunuslu-bralet",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop",
    category: "Sütyenlər",
    sizes: ["70B", "75B", "80B", "85B"],
    colors: ["Qara", "Krem"],
    colorHex: ["#111111", "#f1d7ce"],
    stock: 18,
  },
  {
    id: "high-waist-brief",
    name: "Yüksək Bel Alt Geyim",
    slug: "yuksek-bel-alt-geyim",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop",
    category: "Alt geyimlər",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Bej", "Pudra"],
    colorHex: ["#d8a996", "#eec9cc"],
    stock: 32,
  },
  {
    id: "lace-push-up-bra",
    name: "Dantelli Push-up Sütyen",
    slug: "dantelli-push-up-sutyen",
    price: 54.99,
    image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691792-d1d42acfd860?q=80&w=1200&auto=format&fit=crop",
    ],
    category: "Sütyenlər",
    sizes: ["70B", "75B", "80B", "85B"],
    colors: ["Burqundi", "Açıq pudra", "Şampan"],
    colorHex: ["#7a1026", "#e9b8bd", "#ead7cd"],
    stock: 20,
    isNew: true,
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
