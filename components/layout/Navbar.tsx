import Link from "next/link";
import { Heart, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthNavButton } from "@/components/layout/AuthNavButton";
import { CartDrawer } from "@/components/layout/CartDrawer";

const navItems = [
  { href: "/", label: "Ana səhifə" },
  { href: "/products", label: "Məhsullar" },
  { href: "/#categories", label: "Kolleksiyalar" },
  { href: "/#new", label: "Yeni gələnlər" },
  { href: "/#sale", label: "Endirimlər" },
  { href: "/#about", label: "Haqqımızda" },
  { href: "/#contact", label: "Əlaqə" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-[#fff7f6]/95 backdrop-blur">
      <div className="bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground">
        İlk sifarişinizdə 10% ENDİRİM | Kod: XOSGELDIN
      </div>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menyunu aç">
          <Menu />
        </Button>
        <Link href="/" className="font-serif text-3xl font-semibold tracking-wide text-primary">
          NAS XANIM
        </Link>
        <div className="hidden items-center gap-7 text-xs font-semibold text-primary md:flex">
          {navItems.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} className="hover:text-primary/70">
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Axtar">
            <Search />
          </Button>
          <AuthNavButton />
          <Button variant="ghost" size="icon" aria-label="İstək siyahısı" className="hidden sm:inline-flex">
            <Heart />
          </Button>
          <div className="hidden sm:block">
            <CartDrawer />
          </div>
        </div>
      </nav>
    </header>
  );
}
