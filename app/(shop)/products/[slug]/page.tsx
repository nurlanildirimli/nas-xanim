import Image from "next/image";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { ProductActions } from "@/components/product/ProductActions";
import { Separator } from "@/components/ui/separator";
import { aznFormatter } from "@/lib/utils";
import { getProductBySlug, getProductSlugs } from "@/lib/shop-data";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const products = await getProductSlugs();

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return {
    title: product ? `${product.name} | NAS XANIM` : "Məhsul | NAS XANIM",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const gallery = product.gallery ?? [product.image];

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <div className="mb-5 text-xs text-muted-foreground">Ana səhifə / {product.category} / {product.name}</div>
      <div className="grid gap-8 rounded-lg border border-primary/10 bg-white p-3 shadow-sm md:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] md:p-5">
        <div className="grid gap-3 md:grid-cols-[74px_1fr]">
          <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col">
            {gallery.map((image) => (
              <div key={image} className="relative size-16 shrink-0 overflow-hidden rounded-md border bg-secondary md:size-[74px]">
                <Image src={image} alt={product.name} fill sizes="74px" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-md bg-secondary md:order-2">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 768px) 52vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center gap-5 md:px-3">
          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold text-muted-foreground">{product.category}</p>
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-3 fill-primary" />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">(24)</span>
              </div>
            </div>
            <h1 className="font-serif text-3xl font-semibold leading-tight md:text-4xl">{product.name}</h1>
            <p className="mt-3 text-lg font-semibold text-primary">{aznFormatter.format(product.price)}</p>
          </div>
          <ProductActions product={product} />
          <p className="text-sm font-medium text-green-700">Stokda var</p>
          <Separator />
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              Zərif dantelli materialı, yumşaq toxunuşu və günboyu rahat hissi ilə gündəlik istifadə üçün seçilib.
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>Push-up effekt</li>
              <li>Tənzimlənən askılar</li>
              <li>Dantelli və yumşaq parça</li>
              <li>Gündəlik istifadə üçün uyğundur</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
