"use client";

import Link from "next/link";
import { Grid2X2, Heart, Home, User } from "lucide-react";
import { CartDrawer } from "@/components/layout/CartDrawer";

const items = [
  { href: "/", label: "Ana səhifə", icon: Home },
  { href: "/#categories", label: "Kateqoriyalar", icon: Grid2X2 },
  { href: "/#new", label: "Seçilənlər", icon: Heart },
  { href: "/account", label: "Hesabım", icon: User },
];

export function MobileBottomNav() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/10 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(122,16,38,0.08)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5 items-center text-[10px] font-medium text-primary">
        {items.slice(0, 2).map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
        <div className="flex justify-center">
          <CartDrawer compact />
        </div>
        {items.slice(2).map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
