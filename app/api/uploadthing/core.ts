import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { requireAdmin } from "@/lib/auth";

const upload = createUploadthing({
  errorFormatter: (error) => ({
    message: error.message,
  }),
});

export const uploadRouter = {
  productImage: upload({ image: { maxFileSize: "16MB", maxFileCount: 6 } })
    .middleware(async ({ req }) => {
      try {
        const user = await requireAdmin(req);
        return { userId: user.id };
      } catch {
        throw new UploadThingError("Unauthorized");
      }
    })
    .onUploadComplete(async ({ file, metadata }) => ({
      url: file.ufsUrl,
      uploadedBy: metadata.userId,
    })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
