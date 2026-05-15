"use client";

import { FormEvent, useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, Loader2, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getFirebaseAuth } from "@/lib/firebase";
import { useUploadThing } from "@/lib/uploadthing";
import { aznFormatter } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { SerializedOrder } from "@/lib/orders/serializers";

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
};

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  categoryId: string;
  categoryName: string;
  sizes: string[];
  colors: string[];
  colorHex: string[];
  stock: number;
  isNew: boolean;
};

type AdminOrder = SerializedOrder;
type OrderStatusValue = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type CategoryForm = {
  id?: string;
  name: string;
  slug: string;
  image: string;
};

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  price: string;
  categoryId: string;
  images: ProductImageItem[];
  imageUrl: string;
  sizes: string;
  colors: string;
  colorHex: string;
  stock: string;
  isNew: boolean;
};

type UploadedFile = {
  key?: string;
  url?: string;
  appUrl?: string;
  ufsUrl?: string;
  error?: {
    message?: string;
  };
  serverData?: {
    url?: string;
    appUrl?: string;
    ufsUrl?: string;
  };
};

type ProductImageItem =
  | {
      id: string;
      kind: "remote";
      url: string;
    }
  | {
      id: string;
      kind: "local";
      name: string;
      previewUrl: string;
      file: File;
    };

type UploadCandidate = {
  id: string;
  file: File;
};

type ProductFilters = {
  query: string;
  categoryId: string;
  stock: "all" | "in-stock" | "out-of-stock";
  newOnly: boolean;
};

type OrderFilters = {
  query: string;
  status: "all" | OrderStatusValue;
  sort: "newest" | "oldest";
};

const emptyCategoryForm: CategoryForm = {
  name: "",
  slug: "",
  image: "",
};

const emptyProductForm: ProductForm = {
  name: "",
  slug: "",
  price: "",
  categoryId: "",
  images: [],
  imageUrl: "",
  sizes: "",
  colors: "",
  colorHex: "",
  stock: "0",
  isNew: false,
};

function remoteImageItem(url: string): ProductImageItem {
  return {
    id: `remote-${url}`,
    kind: "remote",
    url,
  };
}

function localImageItem(file: File): ProductImageItem {
  return {
    id: `local-${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    kind: "local",
    name: file.name,
    previewUrl: URL.createObjectURL(file),
    file,
  };
}

function getImagePreviewUrl(item: ProductImageItem) {
  return item.kind === "remote" ? item.url : item.previewUrl;
}

const orderStatuses: OrderStatusValue[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const emptyProductFilters: ProductFilters = {
  query: "",
  categoryId: "all",
  stock: "all",
  newOnly: false,
};
const emptyOrderFilters: OrderFilters = {
  query: "",
  status: "all",
  sort: "newest",
};

function parseCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinCsv(value: string[]) {
  return value.join(", ");
}

async function readError(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    error?: string;
    issues?: Array<{
      path?: Array<string | number>;
      message?: string;
    }>;
  } | null;
  const issue = data?.issues?.[0];

  if (issue?.message) {
    const path = issue.path?.join(".");
    return path ? `${data?.error ?? "Invalid input"}: ${path} - ${issue.message}` : issue.message;
  }

  return data?.error ?? "Əməliyyat tamamlanmadı.";
}

function shortOrderId(id: string) {
  return `#${id.slice(-8).toUpperCase()}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("az-AZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getUploadedFileUrl(file: UploadedFile) {
  if (file.serverData?.ufsUrl) return file.serverData.ufsUrl;
  if (file.serverData?.url) return file.serverData.url;
  if (file.serverData?.appUrl) return file.serverData.appUrl;
  if (file.ufsUrl) return file.ufsUrl;
  if (file.url) return file.url;
  if (file.appUrl) return file.appUrl;
  if (file.key) return `https://utfs.io/f/${file.key}`;
  return null;
}

export function AdminDashboard() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderStatusDrafts, setOrderStatusDrafts] = useState<Record<string, OrderStatusValue>>({});
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [productFilters, setProductFilters] = useState<ProductFilters>(emptyProductFilters);
  const [orderFilters, setOrderFilters] = useState<OrderFilters>(emptyOrderFilters);
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "orders">("products");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const uploadResultRef = useRef<UploadedFile[] | undefined>(undefined);

  const filteredProducts = useMemo(() => {
    const query = productFilters.query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        query.length === 0 ||
        [product.name, product.slug, product.categoryName].some((value) => value.toLowerCase().includes(query));
      const matchesCategory = productFilters.categoryId === "all" || product.categoryId === productFilters.categoryId;
      const matchesStock =
        productFilters.stock === "all" ||
        (productFilters.stock === "in-stock" && product.stock > 0) ||
        (productFilters.stock === "out-of-stock" && product.stock <= 0);
      const matchesNew = !productFilters.newOnly || product.isNew;

      return matchesQuery && matchesCategory && matchesStock && matchesNew;
    });
  }, [productFilters, products]);

  const filteredOrders = useMemo(() => {
    const query = orderFilters.query.trim().toLowerCase();

    return orders
      .filter((order) => {
        const matchesQuery =
          query.length === 0 ||
          [order.id, order.customerName, order.phone, order.userEmail].some((value) =>
            value.toLowerCase().includes(query),
          );
        const matchesStatus = orderFilters.status === "all" || order.status === orderFilters.status;

        return matchesQuery && matchesStatus;
      })
      .sort((first, second) => {
        const firstTime = new Date(first.createdAt).getTime();
        const secondTime = new Date(second.createdAt).getTime();
        return orderFilters.sort === "newest" ? secondTime - firstTime : firstTime - secondTime;
      });
  }, [orderFilters, orders]);

  const auth = useMemo(() => getFirebaseAuth(), []);
  const { startUpload, isUploading } = useUploadThing("productImage", {
    onClientUploadComplete: (result) => {
      uploadResultRef.current = result as UploadedFile[];
    },
    onUploadError: (error) => {
      setMessage(`Şəkil yüklənmədi: ${error.message}`);
    },
    headers: async () => {
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  });

  const adminFetch = useCallback(async (path: string, init: RequestInit = {}) => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(path, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init.headers ?? {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(await readError(response));
    }

    return response.json();
  }, [auth]);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const [categoryData, productData, orderData] = await Promise.all([
        adminFetch("/api/admin/categories"),
        adminFetch("/api/admin/products"),
        adminFetch("/api/admin/orders"),
      ]);
      setCategories(categoryData.categories ?? []);
      setProducts(productData.products ?? []);
      setOrders(orderData.orders ?? []);
      setOrderStatusDrafts(
        Object.fromEntries(
          ((orderData.orders ?? []) as AdminOrder[]).map((order) => [order.id, order.status as OrderStatusValue]),
        ),
      );
      setProductForm((current) => ({
        ...current,
        categoryId: current.categoryId || categoryData.categories?.[0]?.id || "",
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Admin məlumatları yüklənmədi.");
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  const { user, loading: authLoading, logout } = useAuth({
    onUser: () => {
      void loadAdminData();
    },
  });

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const path = categoryForm.id ? `/api/admin/categories/${categoryForm.id}` : "/api/admin/categories";
      const method = categoryForm.id ? "PATCH" : "POST";
      await adminFetch(path, {
        method,
        body: JSON.stringify(categoryForm),
      });
      setCategoryForm(emptyCategoryForm);
      await loadAdminData();
      setMessage("Kateqoriya yadda saxlanıldı.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kateqoriya saxlanılmadı.");
    } finally {
      setLoading(false);
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const finalImages = await uploadPendingProductImages(productForm.images);

      if (finalImages.length === 0) {
        throw new Error("Məhsul üçün ən azı bir şəkil əlavə edin.");
      }

      const payload = {
        name: productForm.name,
        slug: productForm.slug,
        price: productForm.price,
        categoryId: productForm.categoryId,
        images: finalImages,
        sizes: parseCsv(productForm.sizes),
        colors: parseCsv(productForm.colors),
        colorHex: parseCsv(productForm.colorHex),
        stock: productForm.stock,
        isNew: productForm.isNew,
      };
      const path = productForm.id ? `/api/admin/products/${productForm.id}` : "/api/admin/products";
      const method = productForm.id ? "PATCH" : "POST";
      await adminFetch(path, {
        method,
        body: JSON.stringify(payload),
      });
      setProductForm({ ...emptyProductForm, categoryId: categories[0]?.id ?? "" });
      await loadAdminData();
      setMessage("Məhsul yadda saxlanıldı.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Məhsul saxlanılmadı.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadPendingProductImages(images: ProductImageItem[]) {
    const localItems = images.filter((item): item is Extract<ProductImageItem, { kind: "local" }> => item.kind === "local");

    if (localItems.length === 0) {
      return images.map((item) => (item.kind === "remote" ? item.url : item.previewUrl));
    }

    uploadResultRef.current = undefined;
    const uploadCandidates = localItems.map((item): UploadCandidate => ({ id: item.id, file: item.file }));
    const uploadResult = (await startUpload(uploadCandidates.map((item) => item.file))) as UploadedFile[] | undefined;
    await new Promise((resolve) => setTimeout(resolve, 250));
    const result = uploadResult?.length ? uploadResult : uploadResultRef.current;
    const failedFile = result?.find((file) => file.error);

    if (failedFile?.error?.message) {
      throw new Error(`Şəkil yüklənmədi: ${failedFile.error.message}`);
    }

    const uploadedUrls =
      result
        ?.map(getUploadedFileUrl)
        .filter((url): url is string => Boolean(url)) ?? [];

    if (uploadedUrls.length !== localItems.length) {
      const fields = result?.[0] ? Object.keys(result[0]).join(", ") : "nəticə boşdur";
      throw new Error(`Upload tamamlandı, amma bütün URL-lər qaytarılmadı. Qayıdan sahələr: ${fields}`);
    }

    let localIndex = 0;
    return images.map((item) => {
      if (item.kind === "remote") return item.url;
      const url = uploadedUrls[localIndex];
      localIndex += 1;
      return url;
    });
  }

  async function deleteCategory(category: AdminCategory) {
    if (!confirm(`${category.name} kateqoriyasını silmək istəyirsiniz?`)) return;

    setLoading(true);
    setMessage(null);

    try {
      await adminFetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      await loadAdminData();
      setMessage("Kateqoriya silindi.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kateqoriya silinmədi.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(product: AdminProduct) {
    if (!confirm(`${product.name} məhsulunu silmək istəyirsiniz?`)) return;

    setLoading(true);
    setMessage(null);

    try {
      const data = (await adminFetch(`/api/admin/products/${product.id}`, { method: "DELETE" })) as {
        warning?: string | null;
      };
      await loadAdminData();
      setMessage(data.warning ? `Məhsul silindi. ${data.warning}` : "Məhsul silindi.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Məhsul silinmədi.");
    } finally {
      setLoading(false);
    }
  }

  function uploadImages(files: FileList | null) {
    if (!files?.length) return;

    setMessage(null);

    const selectedFiles = Array.from(files);
    const invalidFile = selectedFiles.find((file) => !file.type.startsWith("image/"));
    const oversizedFile = selectedFiles.find((file) => file.size > 16 * 1024 * 1024);

    if (invalidFile) {
      setMessage(`${invalidFile.name} şəkil faylı deyil.`);
      return;
    }

    if (oversizedFile) {
      setMessage(`${oversizedFile.name} 16MB limitindən böyükdür.`);
      return;
    }

    setProductForm((current) => ({
      ...current,
      images: [...current.images, ...selectedFiles.map(localImageItem)],
    }));
  }

  function addManualImageUrl() {
    const url = productForm.imageUrl.trim();
    if (!url) return;

    try {
      new URL(url);
    } catch {
      setMessage("Şəkil URL düzgün deyil. Tam https:// URL daxil edin.");
      return;
    }

    setProductForm((current) => ({
      ...current,
      images: [...current.images, remoteImageItem(url)],
      imageUrl: "",
    }));
    setMessage(null);
  }

  function moveProductImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= productForm.images.length) return;

    setProductForm((current) => {
      const images = [...current.images];
      const currentImage = images[index];
      images[index] = images[nextIndex];
      images[nextIndex] = currentImage;
      return { ...current, images };
    });
  }

  function removeProductImage(index: number) {
    setProductForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  }

  function editCategory(category: AdminCategory) {
    setActiveTab("categories");
    setCategoryForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
    });
  }

  function editProduct(product: AdminProduct) {
    setActiveTab("products");
    setProductForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: String(product.price),
      categoryId: product.categoryId,
      images: product.images.map(remoteImageItem),
      imageUrl: "",
      sizes: joinCsv(product.sizes),
      colors: joinCsv(product.colors),
      colorHex: joinCsv(product.colorHex),
      stock: String(product.stock),
      isNew: product.isNew,
    });
  }

  async function updateOrderStatus(order: AdminOrder) {
    setLoading(true);
    setMessage(null);

    try {
      const status = orderStatusDrafts[order.id] ?? (order.status as OrderStatusValue);
      const data = (await adminFetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })) as { order: AdminOrder };

      setOrders((current) => current.map((item) => (item.id === order.id ? data.order : item)));
      setSelectedOrder((current) => (current?.id === order.id ? data.order : current));
      setOrderStatusDrafts((current) => ({ ...current, [order.id]: data.order.status as OrderStatusValue }));
      setMessage("Sifariş statusu yeniləndi.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sifariş statusu yenilənmədi.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <Loader2 className="size-6 animate-spin text-primary" />
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12">
        <Card className="w-full border-primary/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Admin giriş</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Admin panelindən istifadə etmək üçün Firebase hesabınızla daxil olun.
            </p>
            <Button asChild className="w-full">
              <Link href="/login?next=/admin">Daxil ol</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">NAS XANIM Admin</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Məhsul idarəetməsi</h1>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void loadAdminData()} disabled={loading}>
            Yenilə
          </Button>
          <Button type="button" variant="secondary" onClick={() => void logout()}>
            Çıxış
          </Button>
        </div>
      </div>

      {message ? (
        <div className="mb-5 rounded-md border border-primary/15 bg-white px-4 py-3 text-sm text-primary">
          {message}
        </div>
      ) : null}

      <div className="mb-6 inline-flex rounded-md border bg-white p-1">
        <Button
          type="button"
          variant={activeTab === "products" ? "default" : "ghost"}
          onClick={() => setActiveTab("products")}
        >
          Məhsullar
        </Button>
        <Button
          type="button"
          variant={activeTab === "categories" ? "default" : "ghost"}
          onClick={() => setActiveTab("categories")}
        >
          Kateqoriyalar
        </Button>
        <Button
          type="button"
          variant={activeTab === "orders" ? "default" : "ghost"}
          onClick={() => setActiveTab("orders")}
        >
          Sifarişlər
        </Button>
      </div>

      {activeTab === "products" ? (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <ProductFormCard
            categories={categories}
            form={productForm}
            isUploading={isUploading}
            loading={loading}
            onChange={setProductForm}
            onSubmit={saveProduct}
            onUpload={uploadImages}
            onAddImageUrl={addManualImageUrl}
            onMoveImage={moveProductImage}
            onRemoveImage={removeProductImage}
            onReset={() => setProductForm({ ...emptyProductForm, categoryId: categories[0]?.id ?? "" })}
          />
          <ProductList
            products={filteredProducts}
            totalProducts={products.length}
            categories={categories}
            filters={productFilters}
            onFiltersChange={setProductFilters}
            onFiltersReset={() => setProductFilters(emptyProductFilters)}
            onDelete={deleteProduct}
            onEdit={editProduct}
          />
        </div>
      ) : null}

      {activeTab === "categories" ? (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <CategoryFormCard
            form={categoryForm}
            loading={loading}
            onChange={setCategoryForm}
            onSubmit={saveCategory}
            onReset={() => setCategoryForm(emptyCategoryForm)}
          />
          <CategoryList categories={categories} onDelete={deleteCategory} onEdit={editCategory} />
        </div>
      ) : null}

      {activeTab === "orders" ? (
        <OrderList
          orders={filteredOrders}
          totalOrders={orders.length}
          filters={orderFilters}
          statusDrafts={orderStatusDrafts}
          loading={loading}
          onFiltersChange={setOrderFilters}
          onFiltersReset={() => setOrderFilters(emptyOrderFilters)}
          onOpenOrder={setSelectedOrder}
          onStatusChange={(orderId, status) => setOrderStatusDrafts((current) => ({ ...current, [orderId]: status }))}
          onStatusSave={updateOrderStatus}
        />
      ) : null}

      <OrderDetailSheet
        order={selectedOrder}
        statusDrafts={orderStatusDrafts}
        loading={loading}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
        onStatusChange={(orderId, status) => setOrderStatusDrafts((current) => ({ ...current, [orderId]: status }))}
        onStatusSave={updateOrderStatus}
      />
    </section>
  );
}

function ProductFormCard({
  categories,
  form,
  isUploading,
  loading,
  onChange,
  onSubmit,
  onUpload,
  onAddImageUrl,
  onMoveImage,
  onRemoveImage,
  onReset,
}: {
  categories: AdminCategory[];
  form: ProductForm;
  isUploading: boolean;
  loading: boolean;
  onChange: (form: ProductForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpload: (files: FileList | null) => void;
  onAddImageUrl: () => void;
  onMoveImage: (index: number, direction: -1 | 1) => void;
  onRemoveImage: (index: number) => void;
  onReset: () => void;
}) {
  return (
    <Card className="border-primary/10 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{form.id ? "Məhsulu redaktə et" : "Yeni məhsul"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input placeholder="Ad" value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} />
          <Input placeholder="Slug" value={form.slug} onChange={(event) => onChange({ ...form, slug: event.target.value })} />
          <Input placeholder="Qiymət" value={form.price} onChange={(event) => onChange({ ...form, price: event.target.value })} />
          <select
            className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
            value={form.categoryId}
            onChange={(event) => onChange({ ...form, categoryId: event.target.value })}
            required
          >
            <option value="">Kateqoriya seçin</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="space-y-3 rounded-md border bg-secondary/50 p-3">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                placeholder="Şəkil URL əlavə et"
                value={form.imageUrl}
                onChange={(event) => onChange({ ...form, imageUrl: event.target.value })}
              />
              <Button type="button" variant="outline" onClick={onAddImageUrl}>
                Əlavə et
              </Button>
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-primary/30 bg-white px-4 py-3 text-sm font-semibold text-primary">
              {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
              Kompüterdən şəkil seç
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={isUploading}
                onChange={(event) => void onUpload(event.target.files)}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              {form.images.map((image, index) => (
                <div key={image.id} className="rounded-md border bg-white p-2">
                  <div className="relative aspect-square overflow-hidden rounded bg-secondary">
                    <Image
                      src={getImagePreviewUrl(image)}
                      alt={image.kind === "local" ? image.name : `Məhsul şəkli ${index + 1}`}
                      fill
                      sizes="180px"
                      className="object-cover"
                      unoptimized={image.kind === "local"}
                    />
                    {index === 0 ? (
                      <Badge className="absolute left-2 top-2">Əsas</Badge>
                    ) : null}
                    {image.kind === "local" ? (
                      <Badge variant="secondary" className="absolute bottom-2 left-2">
                        Yadda saxlanacaq
                      </Badge>
                    ) : null}
                  </div>
                  {image.kind === "local" ? (
                    <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{image.name}</p>
                  ) : null}
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={index === 0}
                      onClick={() => onMoveImage(index, -1)}
                      aria-label="Şəkli əvvələ çək"
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={index === form.images.length - 1}
                      onClick={() => onMoveImage(index, 1)}
                      aria-label="Şəkli sona çək"
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onRemoveImage(index)}
                      aria-label="Şəkli sil"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {form.images.length === 0 ? (
              <p className="text-xs text-muted-foreground">Ən azı bir şəkil əlavə edin. İlk şəkil mağazada əsas şəkil kimi görünəcək.</p>
            ) : null}
          </div>
          <Input placeholder="Ölçülər: 70B, 75B" value={form.sizes} onChange={(event) => onChange({ ...form, sizes: event.target.value })} />
          <Input placeholder="Rənglər: Burqundi, Qara" value={form.colors} onChange={(event) => onChange({ ...form, colors: event.target.value })} />
          <Input placeholder="Rəng HEX: #7a1026, #111111" value={form.colorHex} onChange={(event) => onChange({ ...form, colorHex: event.target.value })} />
          <Input placeholder="Stok" value={form.stock} onChange={(event) => onChange({ ...form, stock: event.target.value })} />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(event) => onChange({ ...form, isNew: event.target.checked })}
            />
            Yeni məhsul
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              <Plus />
              Yadda saxla
            </Button>
            <Button type="button" variant="outline" onClick={onReset}>
              Təmizlə
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function OrderList({
  orders,
  totalOrders,
  filters,
  statusDrafts,
  loading,
  onFiltersChange,
  onFiltersReset,
  onOpenOrder,
  onStatusChange,
  onStatusSave,
}: {
  orders: AdminOrder[];
  totalOrders: number;
  filters: OrderFilters;
  statusDrafts: Record<string, OrderStatusValue>;
  loading: boolean;
  onFiltersChange: (filters: OrderFilters) => void;
  onFiltersReset: () => void;
  onOpenOrder: (order: AdminOrder) => void;
  onStatusChange: (orderId: string, status: OrderStatusValue) => void;
  onStatusSave: (order: AdminOrder) => void;
}) {
  return (
    <Card className="border-primary/10 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Sifarişlər ({orders.length}/{totalOrders})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-md border bg-secondary/50 p-3 md:grid-cols-[1fr_160px_140px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Sifariş, müştəri, telefon, email"
              value={filters.query}
              onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-white px-3 text-sm"
            value={filters.status}
            onChange={(event) => onFiltersChange({ ...filters, status: event.target.value as OrderFilters["status"] })}
          >
            <option value="all">Bütün statuslar</option>
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-input bg-white px-3 text-sm"
            value={filters.sort}
            onChange={(event) => onFiltersChange({ ...filters, sort: event.target.value as OrderFilters["sort"] })}
          >
            <option value="newest">Yeni əvvəl</option>
            <option value="oldest">Köhnə əvvəl</option>
          </select>
          <Button type="button" variant="outline" onClick={onFiltersReset}>
            Təmizlə
          </Button>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-md border bg-secondary p-5 text-sm text-muted-foreground">
            Filtrlərə uyğun sifariş tapılmadı.
          </div>
        ) : null}

        {orders.map((order) => {
          const draftStatus = statusDrafts[order.id] ?? (order.status as OrderStatusValue);

          return (
            <div key={order.id} className="rounded-md border p-4">
              <div className="grid gap-4 xl:grid-cols-[1fr_260px] xl:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{shortOrderId(order.id)}</p>
                    <Badge variant="secondary">{order.status}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {order.customerName} · {order.userEmail} · {order.items.length} məhsul
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.phone} · {order.addressLine}, {order.city}
                  </p>
                  <p className="mt-2 font-semibold text-primary">{aznFormatter.format(order.total)}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {order.items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.productSlug}`}
                        className="grid grid-cols-[44px_1fr] gap-2 rounded-md bg-secondary p-2 text-xs"
                      >
                        <div className="relative aspect-square overflow-hidden rounded bg-white">
                          {item.productImage ? (
                            <Image src={item.productImage} alt={item.productName} fill sizes="44px" className="object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <p className="line-clamp-1 font-semibold">{item.productName}</p>
                          <p className="mt-1 text-muted-foreground">
                            {item.quantity} x {item.size} / {item.color}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 xl:flex-col">
                  <select
                    className="h-10 min-w-0 flex-1 rounded-md border border-input bg-white px-3 text-sm"
                    value={draftStatus}
                    onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatusValue)}
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <Button type="button" onClick={() => onStatusSave(order)} disabled={loading}>
                    Yadda saxla
                  </Button>
                  <Button type="button" variant="outline" onClick={() => onOpenOrder(order)}>
                    <Eye />
                    Detallar
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function OrderDetailSheet({
  order,
  statusDrafts,
  loading,
  onOpenChange,
  onStatusChange,
  onStatusSave,
}: {
  order: AdminOrder | null;
  statusDrafts: Record<string, OrderStatusValue>;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (orderId: string, status: OrderStatusValue) => void;
  onStatusSave: (order: AdminOrder) => void;
}) {
  const draftStatus = order ? statusDrafts[order.id] ?? (order.status as OrderStatusValue) : "PENDING";

  return (
    <Sheet open={Boolean(order)} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(94vw,560px)] overflow-y-auto">
        {order ? (
          <>
            <SheetHeader>
              <SheetTitle>Sifariş {shortOrderId(order.id)}</SheetTitle>
              <SheetDescription>
                {formatDate(order.createdAt)} · {order.userEmail}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-5">
              <div className="rounded-md border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Status</p>
                    <Badge className="mt-2">{order.status}</Badge>
                  </div>
                  <p className="font-semibold text-primary">{aznFormatter.format(order.total)}</p>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <select
                    className="h-10 rounded-md border border-input bg-white px-3 text-sm"
                    value={draftStatus}
                    onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatusValue)}
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <Button type="button" disabled={loading} onClick={() => onStatusSave(order)}>
                    Yadda saxla
                  </Button>
                </div>
              </div>

              <div className="rounded-md border bg-white p-4 text-sm">
                <p className="font-semibold">Müştəri və çatdırılma</p>
                <div className="mt-3 space-y-2 text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">{order.customerName}</span> · {order.phone}
                  </p>
                  <p>
                    {order.addressLine}, {order.city}
                    {order.postalCode ? ` ${order.postalCode}` : ""}
                  </p>
                  <p>{order.userEmail}</p>
                  {order.note ? <p>Qeyd: {order.note}</p> : null}
                </div>
              </div>

              <div className="rounded-md border bg-white p-4">
                <p className="font-semibold">Məhsullar ({order.items.length})</p>
                <div className="mt-4 space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id}>
                      <div className="grid grid-cols-[64px_1fr] gap-3">
                        <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
                          {item.productImage ? (
                            <Image src={item.productImage} alt={item.productName} fill sizes="64px" className="object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <Link href={`/products/${item.productSlug}`} className="font-semibold hover:text-primary">
                            {item.productName}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.size} · {item.color} · {item.quantity} ədəd
                          </p>
                          <p className="mt-2 text-sm font-semibold">
                            {aznFormatter.format(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function CategoryFormCard({
  form,
  loading,
  onChange,
  onSubmit,
  onReset,
}: {
  form: CategoryForm;
  loading: boolean;
  onChange: (form: CategoryForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}) {
  return (
    <Card className="border-primary/10 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{form.id ? "Kateqoriyanı redaktə et" : "Yeni kateqoriya"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input placeholder="Ad" value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} />
          <Input placeholder="Slug" value={form.slug} onChange={(event) => onChange({ ...form, slug: event.target.value })} />
          <Input placeholder="Şəkil URL" value={form.image} onChange={(event) => onChange({ ...form, image: event.target.value })} />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              <Plus />
              Yadda saxla
            </Button>
            <Button type="button" variant="outline" onClick={onReset}>
              Təmizlə
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ProductList({
  products,
  totalProducts,
  categories,
  filters,
  onFiltersChange,
  onFiltersReset,
  onDelete,
  onEdit,
}: {
  products: AdminProduct[];
  totalProducts: number;
  categories: AdminCategory[];
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onFiltersReset: () => void;
  onDelete: (product: AdminProduct) => void;
  onEdit: (product: AdminProduct) => void;
}) {
  return (
    <Card className="border-primary/10 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Məhsullar ({products.length}/{totalProducts})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-md border bg-secondary/50 p-3 md:grid-cols-[1fr_180px_150px_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Ad, slug və ya kateqoriya"
              value={filters.query}
              onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-white px-3 text-sm"
            value={filters.categoryId}
            onChange={(event) => onFiltersChange({ ...filters, categoryId: event.target.value })}
          >
            <option value="all">Bütün kateqoriyalar</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-input bg-white px-3 text-sm"
            value={filters.stock}
            onChange={(event) => onFiltersChange({ ...filters, stock: event.target.value as ProductFilters["stock"] })}
          >
            <option value="all">Bütün stok</option>
            <option value="in-stock">Stokda var</option>
            <option value="out-of-stock">Stok yoxdur</option>
          </select>
          <label className="flex h-10 items-center gap-2 whitespace-nowrap rounded-md border bg-white px-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={filters.newOnly}
              onChange={(event) => onFiltersChange({ ...filters, newOnly: event.target.checked })}
            />
            Yeni
          </label>
          <Button type="button" variant="outline" onClick={onFiltersReset}>
            Təmizlə
          </Button>
        </div>
        {products.length === 0 ? (
          <div className="rounded-md border bg-secondary p-5 text-sm text-muted-foreground">
            Filtrlərə uyğun məhsul tapılmadı.
          </div>
        ) : null}
        {products.map((product) => (
          <div key={product.id}>
            <div className="grid grid-cols-[72px_1fr_auto] gap-3">
              <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill sizes="72px" className="object-cover" />
                ) : null}
              </div>
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {product.categoryName} · {aznFormatter.format(product.price)} · Stok {product.stock}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{product.slug}</p>
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(product)} aria-label="Redaktə et">
                  <Pencil />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(product)} aria-label="Sil">
                  <Trash2 />
                </Button>
              </div>
            </div>
            <Separator className="mt-4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CategoryList({
  categories,
  onDelete,
  onEdit,
}: {
  categories: AdminCategory[];
  onDelete: (category: AdminCategory) => void;
  onEdit: (category: AdminCategory) => void;
}) {
  return (
    <Card className="border-primary/10 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Kateqoriyalar ({categories.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => (
          <div key={category.id}>
            <div className="grid grid-cols-[56px_1fr_auto] gap-3">
              <div className="relative aspect-square overflow-hidden rounded-full bg-secondary">
                {category.image ? (
                  <Image src={category.image} alt={category.name} fill sizes="56px" className="object-cover" />
                ) : null}
              </div>
              <div>
                <p className="font-semibold">{category.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {category.slug} · {category.productCount} məhsul
                </p>
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(category)} aria-label="Redaktə et">
                  <Pencil />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(category)} aria-label="Sil">
                  <Trash2 />
                </Button>
              </div>
            </div>
            <Separator className="mt-4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
