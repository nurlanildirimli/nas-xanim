import Link from "next/link";
import { ProductFilters, ProductSortSelect } from "@/components/filters/ProductFilters";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { getProductFilterOptions, getProductListing, type ProductSort } from "@/lib/shop-data";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function splitParam(value: string | string[] | undefined) {
  return getSingleParam(value)
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePrice(value: string | string[] | undefined) {
  const parsed = Number(getSingleParam(value));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseSort(value: string | string[] | undefined): ProductSort {
  const sort = getSingleParam(value);
  return sort === "price-asc" || sort === "price-desc" || sort === "name-asc" || sort === "newest"
    ? sort
    : "newest";
}

export const metadata = {
  title: "Məhsullar | NAS XANIM",
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = getSingleParam(params.category);
  const listingParams = {
    category,
    sizes: splitParam(params.sizes),
    colors: splitParam(params.colors),
    minPrice: parsePrice(params.minPrice),
    maxPrice: parsePrice(params.maxPrice),
    sort: parseSort(params.sort),
  };

  const [filterOptions, products] = await Promise.all([
    getProductFilterOptions(),
    getProductListing(listingParams),
  ]);
  const activeCategory = filterOptions.categories.find((item) => item.slug === category);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-7 rounded-lg border border-primary/10 bg-white p-5 shadow-sm">
        <p className="text-xs text-muted-foreground">Ana səhifə / Məhsullar</p>
        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-serif text-4xl font-semibold">
              {activeCategory?.name ?? "Bütün məhsullar"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {products.length} məhsul tapıldı
            </p>
          </div>
          <div className="hidden md:block">
            <ProductSortSelect />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-3">
          <ProductFilters options={filterOptions} />
        </aside>
        <div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-primary/10 bg-white p-10 text-center shadow-sm">
              <h2 className="font-serif text-3xl font-semibold">Məhsul tapılmadı</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Seçdiyiniz filterlərə uyğun məhsul yoxdur. Filterləri təmizləyib yenidən yoxlayın.
              </p>
              <Button asChild className="mt-6">
                <Link href="/products">Filterləri təmizlə</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
