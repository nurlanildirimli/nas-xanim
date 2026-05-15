import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="w-full border-primary/10 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Qeydiyyat</CardTitle>
          <CardDescription>NAS XANIM hesabınızı yaradın və istək siyahınızı saxlayın.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Suspense fallback={<Skeleton className="h-36 w-full" />}>
            <AuthForm mode="register" />
          </Suspense>
          <p className="text-center text-sm text-muted-foreground">
            Artıq hesabınız var?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Daxil ol
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
