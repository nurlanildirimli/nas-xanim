import { z } from "zod";

const trimmedString = z.string().trim().min(1);
const stringArray = z.array(z.string().trim().min(1)).default([]);

export const categoryInputSchema = z.object({
  name: trimmedString,
  slug: trimmedString,
  image: z.string().trim().url().optional().or(z.literal("")),
});

export const productInputSchema = z.object({
  name: trimmedString,
  slug: trimmedString,
  price: z.coerce.number().positive(),
  categoryId: trimmedString,
  images: z.array(z.string().trim().url()).min(1),
  sizes: stringArray,
  colors: stringArray,
  colorHex: stringArray,
  stock: z.coerce.number().int().min(0),
  isNew: z.coerce.boolean().default(false),
});

export function normalizeOptionalUrl(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}
