import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SaleBanner() {
  return (
    <section id="sale" className="mx-auto max-w-7xl px-4 pb-16">
      <div className="grid min-h-52 overflow-hidden rounded-lg bg-[linear-gradient(100deg,#ffe1e6_0%,#f6cbd3_42%,#7a1026_42%,#8f1730_100%)] md:grid-cols-[0.95fr_1.05fr]">
        <div className="p-8 md:p-10">
          <h2 className="max-w-xs font-serif text-3xl font-semibold leading-tight text-primary">
            Özünə ən gözəl hədiyyəni ver
          </h2>
          <p className="mt-3 max-w-sm text-base leading-6 text-foreground/80">
            Seçilmiş məhsullarda 30%-dək ENDİRİM
          </p>
          <Button asChild className="mt-6">
            <Link href="#new">Endirimləri kəşf et</Link>
          </Button>
        </div>
        <div className="flex items-center justify-center px-8 py-8 text-white">
          <p className="font-serif text-7xl font-semibold md:text-8xl">
            30%
            <span className="ml-2 text-4xl">-dək</span>
          </p>
        </div>
      </div>
    </section>
  );
}
