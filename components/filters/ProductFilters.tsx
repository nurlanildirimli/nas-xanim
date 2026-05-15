"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { CategorySummary } from "@/types";

type FilterOptions = {
  categories: CategorySummary[];
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
};

type ProductFiltersProps = {
  options: FilterOptions;
};

function splitParam(value: string | null) {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

export function ProductFilters({ options }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("category") ?? "";
  const selectedSizes = splitParam(searchParams.get("sizes"));
  const selectedColors = splitParam(searchParams.get("colors"));
  const selectedSort = searchParams.get("sort") ?? "newest";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleListValue(key: "sizes" | "colors", value: string) {
    const current = splitParam(searchParams.get(key));
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    updateParams({ [key]: next.length ? next.join(",") : null });
  }

  const content = (
    <div className="space-y-7">
      <FilterSection title="Kateqoriyalar">
        <div className="space-y-2">
          <FilterButton active={!selectedCategory} onClick={() => updateParams({ category: null })}>
            Hamısı
          </FilterButton>
          {options.categories.map((category) => (
            <FilterButton
              key={category.id}
              active={selectedCategory === category.slug}
              onClick={() => updateParams({ category: category.slug })}
            >
              {category.name}
            </FilterButton>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Ölçü">
        <div className="flex flex-wrap gap-2">
          {options.sizes.map((size) => (
            <Button
              key={size}
              type="button"
              variant={selectedSizes.includes(size) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleListValue("sizes", size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Rəng">
        <div className="flex flex-wrap gap-2">
          {options.colors.map((color) => (
            <Button
              key={color}
              type="button"
              variant={selectedColors.includes(color) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleListValue("colors", color)}
            >
              {color}
            </Button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Qiymət">
        <div className="grid grid-cols-2 gap-2">
          <Input
            inputMode="numeric"
            placeholder={`${options.minPrice}`}
            value={minPrice}
            onChange={(event) => updateParams({ minPrice: event.target.value })}
          />
          <Input
            inputMode="numeric"
            placeholder={`${options.maxPrice}`}
            value={maxPrice}
            onChange={(event) => updateParams({ maxPrice: event.target.value })}
          />
        </div>
      </FilterSection>

      <Button asChild variant="outline" className="w-full">
        <Link href="/products">Təmizlə</Link>
      </Button>
    </div>
  );

  return (
    <>
      <div className="hidden rounded-lg border border-primary/10 bg-white p-5 shadow-sm lg:block">
        {content}
      </div>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" className="w-full">
              <SlidersHorizontal />
              Filtr
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filtrlər</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto pr-1">{content}</div>
          </SheetContent>
        </Sheet>
      </div>
      <select
        className="h-10 rounded-md border border-input bg-white px-3 text-sm lg:hidden"
        value={selectedSort}
        onChange={(event) => updateParams({ sort: event.target.value === "newest" ? null : event.target.value })}
      >
        <SortOptions />
      </select>
    </>
  );
}

export function ProductSortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedSort = searchParams.get("sort") ?? "newest";

  function updateSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <select
      className="h-10 rounded-md border border-input bg-white px-3 text-sm"
      value={selectedSort}
      onChange={(event) => updateSort(event.target.value)}
    >
      <SortOptions />
    </select>
  );
}

function SortOptions() {
  return (
    <>
      <option value="newest">Ən yenilər</option>
      <option value="price-asc">Qiymət: aşağıdan yuxarı</option>
      <option value="price-desc">Qiymət: yuxarıdan aşağı</option>
      <option value="name-asc">Ad: A-Z</option>
    </>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-primary">{title}</h2>
      {children}
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors data-[active=true]:bg-secondary data-[active=true]:font-semibold data-[active=true]:text-primary"
      data-active={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
