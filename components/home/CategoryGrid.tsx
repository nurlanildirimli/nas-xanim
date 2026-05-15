import Image from "next/image";
import Link from "next/link";
import type { CategorySummary } from "@/types";

type CategoryGridProps = {
  categories?: CategorySummary[];
};

export function CategoryGrid({ categories = [] }: CategoryGridProps) {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">Populyar kateqoriyalar</h2>
        </div>
        <Link href="/products" className="text-xs font-semibold text-primary hover:text-primary/70">
          Hamısına bax
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-5 sm:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group text-center"
          >
            <div className="relative mx-auto aspect-square max-w-32 overflow-hidden rounded-full bg-secondary ring-1 ring-primary/10 transition-transform duration-300 group-hover:-translate-y-1">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
            <h3 className="mt-3 text-xs font-semibold sm:text-sm">{category.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
