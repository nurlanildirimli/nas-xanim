"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useHasMounted } from "@/hooks/useHasMounted";
import { aznFormatter } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

type CartDrawerProps = {
  compact?: boolean;
};

export function CartDrawer({ compact = false }: CartDrawerProps) {
  const hasMounted = useHasMounted();
  const storedItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const items = hasMounted ? storedItems : [];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant={compact ? "default" : "ghost"}
          size="icon"
          aria-label="Səbəti aç"
          className={compact ? "relative size-11 rounded-full shadow-lg" : "relative"}
        >
          <ShoppingBag />
          {count > 0 ? (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground ring-2 ring-white">
              {count}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Səbət</SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl bg-secondary p-8 text-center text-sm text-muted-foreground">
            Səbətiniz hələ boşdur.
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="grid grid-cols-[76px_1fr_auto] gap-3 rounded-xl border bg-white p-2"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                    <Image src={item.image} alt={item.name} fill sizes="72px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-primary">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ölçü: {item.size} · {item.color}
                    </p>
                    <p className="mt-2 font-semibold text-primary">{aznFormatter.format(item.price)}</p>
                    <div className="mt-2 inline-flex items-center rounded-md border bg-background">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label="Azalt"
                        onClick={() => decrementItem(item.productId, item.size, item.color)}
                      >
                        <Minus />
                      </Button>
                      <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label="Artır"
                        onClick={() => incrementItem(item.productId, item.size, item.color)}
                      >
                        <Plus />
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Səbətdən sil"
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Endirim kodunuz var?</p>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input placeholder="Kodu daxil edin" />
                  <Button type="button">Tətbiq et</Button>
                </div>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Cəmi</span>
                <span>{aznFormatter.format(total)}</span>
              </div>
              <Button asChild className="w-full">
                <Link href="/checkout">Sifarişi rəsmiləşdir</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
