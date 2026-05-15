"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import type { User } from "firebase/auth";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { aznFormatter } from "@/lib/utils";
import type { SerializedOrder } from "@/lib/orders/serializers";

type OrderDetailClientProps = {
  orderId: string;
};

function shortOrderId(id: string) {
  return `#${id.slice(-8).toUpperCase()}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("az-AZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const [order, setOrder] = useState<SerializedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  const loadOrder = useCallback(async (currentUser: User) => {
    setOrderLoading(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Sifariş tapılmadı.");
      }

      const data = (await response.json()) as { order: SerializedOrder };
      setOrder(data.order);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Sifariş tapılmadı.");
    } finally {
      setOrderLoading(false);
    }
  }, [orderId]);

  const { user, loading } = useAuth({
    onUser: (currentUser) => {
      void loadOrder(currentUser);
    },
  });

  if (loading) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4">
        <Loader2 className="size-6 animate-spin text-primary" />
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12">
        <Card className="w-full border-primary/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Sifariş detalları</CardTitle>
            <CardDescription>Sifariş məlumatlarını görmək üçün daxil olun.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={`/login?next=/account/orders/${orderId}`}>Daxil ol</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/account">
          <ArrowLeft />
          Hesabıma qayıt
        </Link>
      </Button>

      {orderLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : null}

      {error ? (
        <Card className="border-primary/10 bg-white shadow-sm">
          <CardContent className="p-6">
            <p className="font-semibold text-primary">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      {order ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <Card className="border-primary/10 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Sifariş {shortOrderId(order.id)}</CardTitle>
                  <CardDescription>{formatDate(order.createdAt)}</CardDescription>
                </div>
                <Badge>{order.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id}>
                  <div className="grid grid-cols-[72px_1fr] gap-3">
                    <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
                      {item.productImage ? (
                        <Image src={item.productImage} alt={item.productName} fill sizes="72px" className="object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <Link href={`/products/${item.productSlug}`} className="font-semibold hover:text-primary">
                        {item.productName}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.size} · {item.color} · {item.quantity} ədəd
                      </p>
                      <p className="mt-2 text-sm font-semibold">{aznFormatter.format(item.price * item.quantity)}</p>
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-primary/10 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Çatdırılma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Ad</p>
                  <p className="mt-1 font-semibold">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Telefon</p>
                  <p className="mt-1">{order.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Ünvan</p>
                  <p className="mt-1">
                    {order.addressLine}, {order.city}
                    {order.postalCode ? ` ${order.postalCode}` : ""}
                  </p>
                </div>
                {order.note ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Qeyd</p>
                    <p className="mt-1">{order.note}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Yekun</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span>Cəmi</span>
                  <span className="font-semibold text-primary">{aznFormatter.format(order.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </section>
  );
}
