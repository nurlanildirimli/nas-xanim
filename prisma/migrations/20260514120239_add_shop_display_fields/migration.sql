-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "colorHex" TEXT[],
ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT false;
