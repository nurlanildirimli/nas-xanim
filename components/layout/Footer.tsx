import Link from "next/link";

export function Footer() {
  return (
    <footer id="contact" className="bg-[radial-gradient(circle_at_top_right,#9b1835,#650d20_62%)] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1fr_auto]">
        <div>
          <Link href="/" className="font-serif text-4xl font-semibold tracking-wide">
            NAS XANIM
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/78">
            Hər qadının özünü güvənli hiss etməsi üçün yaradılıb.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="space-y-3">
            <p className="font-semibold">Mağaza</p>
            <Link href="/#categories" className="block text-white/72 hover:text-white">
              Kateqoriyalar
            </Link>
            <Link href="/#new" className="block text-white/72 hover:text-white">
              Yeni kolleksiya
            </Link>
            <Link href="/#sale" className="block text-white/72 hover:text-white">
              Endirimlər
            </Link>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Hesab</p>
            <Link href="/login" className="block text-white/72 hover:text-white">
              Daxil ol
            </Link>
            <Link href="/register" className="block text-white/72 hover:text-white">
              Qeydiyyat
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-white/10 px-4 py-5 text-center text-xs text-white/60">
        © 2026 NAS XANIM. Bütün hüquqlar qorunur.
      </div>
    </footer>
  );
}
