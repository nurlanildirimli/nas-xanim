import { OrderDetailClient } from "@/components/orders/OrderDetailClient";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return <OrderDetailClient orderId={id} />;
}
