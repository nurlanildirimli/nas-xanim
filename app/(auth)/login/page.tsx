import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="w-full border-primary/10 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Daxil ol</CardTitle>
          <CardDescription>NAS XANIM hesabınıza email və şifrə ilə daxil olun.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Suspense fallback={<Skeleton className="h-36 w-full" />}>
            <AuthForm mode="login" />
          </Suspense>
          <p className="text-center text-sm text-muted-foreground">
            Hesabınız yoxdur?{" "}
            <Link href="/register" className="font-semibold text-primary">
              Qeydiyyat
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
