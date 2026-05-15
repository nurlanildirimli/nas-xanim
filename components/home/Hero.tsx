import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="overflow-hidden border-b border-primary/10 bg-[linear-gradient(100deg,#ffe1e6_0%,#fff3f4_45%,#f6cbd3_100%)]">
      <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-[0.86fr_1.14fr] md:py-0">
        <div className="relative z-10 max-w-lg">
          <h1 className="font-serif text-5xl font-semibold leading-[0.98] text-primary md:text-7xl">
            Zəriflik
            <span className="block">Sənin təbiətindir</span>
          </h1>
          <p className="mt-6 max-w-sm text-lg leading-7 text-foreground/80">Hər an özünü xüsusi hiss et.</p>
          <Button asChild size="lg" className="mt-8">
            <Link href="#new">Alış-verişə başla</Link>
          </Button>
        </div>
        <div className="relative min-h-[390px] md:min-h-[520px]">
          <div className="absolute inset-x-6 bottom-0 top-0 rounded-full bg-white/20 blur-3xl" />
          <Image
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1400&auto=format&fit=crop"
            alt="NAS XANIM zərif kolleksiya modeli"
            fill
            priority
            sizes="(min-width: 768px) 56vw, 100vw"
            className="object-cover object-top md:object-[center_18%]"
          />
          <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#ffe1e6] to-transparent" />
        </div>
      </div>
    </section>
  );
}
