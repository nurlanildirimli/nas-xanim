import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Hero } from "@/components/home/Hero";
import { NewArrivals } from "@/components/home/NewArrivals";
import { SaleBanner } from "@/components/home/SaleBanner";
import { ServiceStrip } from "@/components/home/ServiceStrip";
import { getHomeCategories, getNewArrivalProducts } from "@/lib/shop-data";

export default async function ShopHomePage() {
  const [categories, products] = await Promise.all([getHomeCategories(), getNewArrivalProducts()]);

  return (
    <>
      <Hero />
      <ServiceStrip />
      <CategoryGrid categories={categories} />
      <NewArrivals products={products} />
      <SaleBanner />
    </>
  );
}
