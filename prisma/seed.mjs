import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local" });
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "Sütyenlər",
    slug: "sutyenler",
    image: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Alt geyimlər",
    slug: "alt-geyimler",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Dəstlər",
    slug: "destler",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Korsetlər",
    slug: "korsetler",
    image: "https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Pijamalar",
    slug: "pijamalar",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Aksesuarlar",
    slug: "aksesuarlar",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=900&auto=format&fit=crop",
  },
];

const products = [
  {
    name: "Zərif Dantelli Dəst",
    slug: "zerif-dantelli-dest",
    price: "59.99",
    images: [
      "https://images.unsplash.com/photo-1618354691551-44de113f0164?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200&auto=format&fit=crop",
    ],
    categorySlug: "destler",
    sizes: ["70B", "75B", "80B", "85B"],
    colors: ["Burqundi", "Qara", "Pudra"],
    colorHex: ["#7a1026", "#111111", "#eec9cc"],
    stock: 14,
    isNew: true,
  },
  {
    name: "İpək Toxunuşlu Bralet",
    slug: "ipek-toxunuslu-bralet",
    price: "49.99",
    images: [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop",
    ],
    categorySlug: "sutyenler",
    sizes: ["70B", "75B", "80B", "85B"],
    colors: ["Qara", "Krem"],
    colorHex: ["#111111", "#f1d7ce"],
    stock: 18,
    isNew: false,
  },
  {
    name: "Yüksək Bel Alt Geyim",
    slug: "yuksek-bel-alt-geyim",
    price: "24.99",
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop",
    ],
    categorySlug: "alt-geyimler",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Bej", "Pudra"],
    colorHex: ["#d8a996", "#eec9cc"],
    stock: 32,
    isNew: false,
  },
  {
    name: "Dantelli Push-up Sütyen",
    slug: "dantelli-push-up-sutyen",
    price: "54.99",
    images: [
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691792-d1d42acfd860?q=80&w=1200&auto=format&fit=crop",
    ],
    categorySlug: "sutyenler",
    sizes: ["70B", "75B", "80B", "85B"],
    colors: ["Burqundi", "Açıq pudra", "Şampan"],
    colorHex: ["#7a1026", "#e9b8bd", "#ead7cd"],
    stock: 20,
    isNew: true,
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        image: category.image,
      },
      create: category,
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: product.categorySlug },
      select: { id: true },
    });

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        price: product.price,
        images: product.images,
        categoryId: category.id,
        sizes: product.sizes,
        colors: product.colors,
        colorHex: product.colorHex,
        stock: product.stock,
        isNew: product.isNew,
      },
      create: {
        name: product.name,
        slug: product.slug,
        price: product.price,
        images: product.images,
        categoryId: category.id,
        sizes: product.sizes,
        colors: product.colors,
        colorHex: product.colorHex,
        stock: product.stock,
        isNew: product.isNew,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
