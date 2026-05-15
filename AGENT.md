# NAS XANIM — Agent Instructions

## Project Overview
NAS XANIM is a lingerie e-commerce platform. Feminine, elegant UI. Azerbaijani market. Mobile-first.

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Firebase Authentication |
| Storage | Uploadthing |
| Database | PostgreSQL via Neon.tech |
| ORM | Prisma |
| State | Zustand (cart + wishlist) |
| Payment | Iyzico |
| Deploy | Vercel |

## Project Structure
```
app/
├── (shop)/         # Customer-facing pages
├── (admin)/        # Admin dashboard
├── (auth)/         # Login / Register
└── api/            # API routes
components/
├── layout/         # Navbar, Footer, AnnouncementBar
├── home/           # Hero, CategoryGrid, NewArrivals, PromoBanner
├── product/        # ProductCard, ProductGrid, ProductImages, SizeSelector, ColorSelector
├── filters/        # FilterSidebar, SizeFilter, ColorFilter, PriceRangeFilter
├── cart/           # CartDrawer, CartItem, CartSummary
└── ui/             # Reusable atoms (Button, Badge, Skeleton, Modal)
lib/                # db.ts, auth.ts, uploadthing.ts, utils.ts
store/              # cartStore.ts, wishlistStore.ts
prisma/             # schema.prisma
types/              # index.ts
```

## Database Models (Prisma)
```prisma
User      → id, email, name, orders[], wishlist[]
Product   → id, name, slug, price, images[], categoryId, sizes[], colors[], stock
Category  → id, name, slug, products[]
Order     → id, userId, items[], total, status, createdAt
OrderItem → id, orderId, productId, quantity, size, color
```

## Key Rules
- **TypeScript only** — no plain JS files
- **Server Components by default** — use `"use client"` only when needed
- **Prisma for all DB queries** — no raw SQL
- **Uploadthing URLs** stored in `Product.images[]` as strings
- **Firebase token** verified server-side on protected API routes
- **Zustand** for cart/wishlist only — no Redux
- **shadcn/ui** components preferred over custom ones
- All prices in **AZN**

## Design System
```
Primary:     #7B1F3A  (dark burgundy)
Secondary:   #F5E6EA  (soft pink)
Accent:      #C4748A  (rose)
Background:  #FAFAFA
Text:        #1A1A1A
```
- Font: elegant serif for headings, clean sans for body
- Mobile-first responsive — all components work on 375px+
- Soft shadows, rounded corners (rounded-2xl), subtle hover animations

## Auth Flow
```
Client → Firebase signIn() → Firebase token
→ Next.js API route verifies token
→ Prisma fetches/creates user in PostgreSQL
```

## Image Upload Flow
```
Admin uploads → Uploadthing → returns URL
→ URL saved to Product.images[] via Prisma
→ Next.js <Image> renders optimized output
```

## Environment Variables
```
DATABASE_URL=          # Neon.tech PostgreSQL
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
```

## Coding Conventions
- Components: PascalCase — `ProductCard.tsx`
- Hooks: camelCase — `useCart.ts`
- API routes: kebab-case — `api/product-list/route.ts`
- Always handle loading + error states
- Use `Skeleton` component for loading UI
- Validate all API inputs with **Zod**

## Priorities
1. Performance — SSR for product pages (SEO critical)
2. Mobile UX — cart drawer, filter sidebar must be touch-friendly
3. Type safety — strict TypeScript throughout
4. Accessibility — aria labels on interactive elements
