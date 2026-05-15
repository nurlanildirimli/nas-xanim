"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Loader2, LogOut, PackageSearch, Shield, Store } from "lucide-react";
import type { User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { aznFormatter } from "@/lib/utils";
import type { SerializedOrder } from "@/lib/orders/serializers";

function shortOrderId(id: string) {
  return `#${id.slice(-8).toUpperCase()}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("az-AZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function AccountPanel() {
  const router = useRouter();
  const [orders, setOrders] = useState<SerializedOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const loadOrders = useCallback(async (currentUser: User) => {
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/orders", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Sifarişlər yüklənmədi.");
      }

      const data = (await response.json()) as { orders?: SerializedOrder[] };
      setOrders(data.orders ?? []);
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : "Sifarişlər yüklənmədi.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const { user, loading, logout } = useAuth({
    onUser: (currentUser) => {
      void loadOrders(currentUser);
    },
  });

  async function handleLogout() {
    await logout();
    setOrders([]);
    router.push("/");
    router.refresh();
  }

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
            <CardTitle>Hesabım</CardTitle>
            <CardDescription>Hesab məlumatlarınızı görmək üçün daxil olun.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button asChild>
              <Link href="/login?next=/account">Daxil ol</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register?next=/account">Qeydiyyat</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <Card className="border-primary/10 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Hesabım</CardTitle>
          <CardDescription>NAS XANIM hesab məlumatlarınız</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 text-sm">
            <div className="rounded-md bg-secondary p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Email</p>
              <p className="mt-1 font-semibold">{user.email}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Ad</p>
              <p className="mt-1">{user.displayName || "Qeyd edilməyib"}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Firebase UID</p>
              <p className="mt-1 break-all font-mono text-xs">{user.uid}</p>
            </div>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/">
                <Store />
                Mağazaya qayıt
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">
                <Shield />
                Admin panel
              </Link>
            </Button>
            <Button type="button" variant="secondary" onClick={() => void handleLogout()}>
              <LogOut />
              Çıxış
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-primary/10 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageSearch className="size-5 text-primary" />
            Sifarişlərim
          </CardTitle>
          <CardDescription>Son sifarişləriniz və status məlumatları</CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Sifarişlər yüklənir...
            </div>
          ) : null}

          {ordersError ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {ordersError}
            </div>
          ) : null}

          {!ordersLoading && !ordersError && orders.length === 0 ? (
            <div className="rounded-md border bg-secondary p-5">
              <p className="font-semibold">Hələ sifariş yoxdur</p>
              <p className="mt-1 text-sm text-muted-foreground">Bəyəndiyiniz məhsulları seçib ilk sifarişinizi yaradın.</p>
              <Button asChild className="mt-4">
                <Link href="/products">Məhsullara bax</Link>
              </Button>
            </div>
          ) : null}

          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="grid gap-3 rounded-md border p-4 transition-colors hover:border-primary/35 hover:bg-secondary sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{shortOrderId(order.id)}</p>
                    <Badge variant="secondary">{order.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(order.createdAt)} · {order.items.length} məhsul
                  </p>
                </div>
                <p className="font-semibold text-primary">{aznFormatter.format(order.total)}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
