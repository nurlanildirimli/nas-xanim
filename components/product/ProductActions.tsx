"use client";

import { useMemo, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import type { ProductSummary } from "@/types";
import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

type ProductActionsProps = {
  product: ProductSummary;
};

export function ProductActions({ product }: ProductActionsProps) {
  const hasMounted = useHasMounted();
  const [size, setSize] = useState(product.sizes[0] ?? "M");
  const [color, setColor] = useState(product.colors[0] ?? "Rose");
  const addItem = useCartStore((state) => state.addItem);
  const isSaved = useWishlistStore((state) => state.has(product.id));
  const toggle = useWishlistStore((state) => state.toggle);
  const showSaved = hasMounted && isSaved;

  const disabled = useMemo(() => product.stock <= 0, [product.stock]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Ölçü</p>
          <button type="button" className="text-xs font-semibold text-primary">
            Ölçü cədvəli
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((item) => (
            <Button
              key={item}
              type="button"
              variant={item === size ? "default" : "outline"}
              size="sm"
              onClick={() => setSize(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold">Rəng: {color}</p>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((item, index) => (
            <button
              key={item}
              type="button"
              aria-label={item}
              className="size-7 rounded-full border border-primary/15 ring-offset-2 transition-all data-[active=true]:ring-2 data-[active=true]:ring-primary"
              data-active={item === color}
              style={{ backgroundColor: product.colorHex?.[index] ?? "#f2cbd1" }}
              onClick={() => setColor(item)}
            />
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        <Button
          type="button"
          size="lg"
          disabled={disabled}
          onClick={() =>
            addItem({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: product.image,
              price: product.price,
              size,
              color,
              quantity: 1,
            })
          }
        >
          <ShoppingBag />
          Səbətə əlavə et
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          aria-label="İstək siyahısını dəyiş"
          onClick={() => toggle(product.id)}
        >
          <Heart className={showSaved ? "fill-primary text-primary" : ""} />
          Bəyənilənlərə əlavə et
        </Button>
      </div>
    </div>
  );
}
