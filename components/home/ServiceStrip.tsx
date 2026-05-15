import { Gift, Headphones, RefreshCcw, Truck } from "lucide-react";

const services = [
  { icon: Truck, title: "Pulsuz çatdırılma", text: "100 AZN və üzəri" },
  { icon: RefreshCcw, title: "Asan qaytarma", text: "14 gün ərzində" },
  { icon: Gift, title: "Gizli qablaşdırma", text: "Tam məxfilik" },
  { icon: Headphones, title: "Müştəri dəstəyi", text: "7/24 dəstək" },
];

export function ServiceStrip() {
  return (
    <section className="border-b border-primary/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <div key={service.title} className="flex items-center justify-center gap-3 text-primary sm:justify-start">
            <service.icon className="size-7 stroke-[1.5]" />
            <div>
              <p className="text-sm font-semibold">{service.title}</p>
              <p className="text-xs text-muted-foreground">{service.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
