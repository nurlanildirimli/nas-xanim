"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useHasMounted } from "@/hooks/useHasMounted";
import { aznFormatter } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

type CheckoutForm = {
  customerName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  note: string;
};

const initialForm: CheckoutForm = {
  customerName: "",
  phone: "",
  addressLine: "",
  city: "Bakı",
  postalCode: "",
  note: "",
};

async function readError(response: Response) {
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  return data?.error ?? "Sifariş tamamlanmadı.";
}

export function CheckoutPageClient() {
  const hasMounted = useHasMounted();
  const { auth, user, loading: authLoading } = useAuth();
  const storedItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const items = useMemo(() => (hasMounted ? storedItems : []), [hasMounted, storedItems]);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderId: string; total: number } | null>(null);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        throw new Error("AUTH_REQUIRED");
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const data = (await response.json()) as { orderId: string; total: number };
      clearCart();
      setSuccess(data);
    } catch (error) {
      setError(error instanceof Error && error.message !== "AUTH_REQUIRED" ? error.message : "Daxil olmaq tələb olunur.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
        <Loader2 className="size-6 animate-spin text-primary" />
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12">
        <Card className="w-full border-primary/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Sifarişi rəsmiləşdir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Sifariş yaratmaq üçün əvvəlcə hesabınıza daxil olun.
            </p>
            <Button asChild className="w-full">
              <Link href="/login?next=/checkout">Daxil ol</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (success) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12">
        <Card className="w-full border-primary/10 bg-white text-center shadow-sm">
          <CardHeader>
            <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
              <Check className="size-7" />
            </div>
            <CardTitle>Sifariş uğurla yaradıldı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Sifariş nömrəsi</p>
            <p className="font-mono text-lg font-semibold text-primary">#{success.orderId.slice(-8).toUpperCase()}</p>
            <p className="font-semibold">Cəmi: {aznFormatter.format(success.total)}</p>
            <Button asChild className="w-full">
              <Link href="/products">Alış-verişə davam et</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12">
        <Card className="w-full border-primary/10 bg-white text-center shadow-sm">
          <CardHeader>
            <CardTitle>Səbətiniz boşdur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Sifariş yaratmaq üçün əvvəlcə məhsul seçin.
            </p>
            <Button asChild className="w-full">
              <Link href="/products">Məhsullara bax</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-7">
        <p className="text-xs text-muted-foreground">Ana səhifə / Checkout</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">Sifarişi rəsmiləşdir</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card className="border-primary/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Əlaqə və çatdırılma</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitOrder} className="space-y-4">
              <Input
                placeholder="Ad Soyad"
                value={form.customerName}
                onChange={(event) => setForm({ ...form, customerName: event.target.value })}
                required
              />
              <Input
                placeholder="Telefon"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                required
              />
              <Input
                placeholder="Ünvan"
                value={form.addressLine}
                onChange={(event) => setForm({ ...form, addressLine: event.target.value })}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  placeholder="Şəhər"
                  value={form.city}
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                  required
                />
                <Input
                  placeholder="Poçt indeksi"
                  value={form.postalCode}
                  onChange={(event) => setForm({ ...form, postalCode: event.target.value })}
                />
              </div>
              <Input
                placeholder="Qeyd"
                value={form.note}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <ShoppingBag />}
                Sifarişi yarat
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="h-fit border-primary/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Sifariş xülasəsi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="grid grid-cols-[64px_1fr] gap-3">
                <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
                <div>
                  <p className="line-clamp-1 text-sm font-semibold">{item.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.size} / {item.color} x {item.quantity}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary">{aznFormatter.format(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Cəmi</span>
              <span>{aznFormatter.format(total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
