import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductSummary } from "@/types";

type NewArrivalsProps = {
  products?: ProductSummary[];
};

export function NewArrivals({ products = [] }: NewArrivalsProps) {
  return (
    <section id="new" className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-7 flex items-end justify-between gap-4">
        <h2 className="font-serif text-3xl font-semibold md:text-4xl">Yeni gələnlər</h2>
        <Link href="/products" className="text-xs font-semibold text-primary hover:text-primary/70">
          Hamısına bax
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
