"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { ProductSummary } from "@/types";
import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/useHasMounted";
import { aznFormatter, cn } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlistStore";

type ProductCardProps = {
  product: ProductSummary;
};

export function ProductCard({ product }: ProductCardProps) {
  const hasMounted = useHasMounted();
  const isSaved = useWishlistStore((state) => state.has(product.id));
  const toggle = useWishlistStore((state) => state.toggle);
  const showSaved = hasMounted && isSaved;

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-secondary shadow-sm">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="İstək siyahısına əlavə et"
          className="absolute right-2 top-2 rounded-full bg-white/80 text-primary hover:bg-white"
          onClick={() => toggle(product.id)}
        >
          <Heart className={cn(showSaved && "fill-primary text-primary")} />
        </Button>
      </div>
      <div className="space-y-2 pt-3">
        <div>
          <Link href={`/products/${product.slug}`} className="line-clamp-1 text-sm font-semibold hover:text-primary">
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
        </div>
        <span className="block text-sm font-semibold text-foreground">{aznFormatter.format(product.price)}</span>
      </div>
    </article>
  );
}
