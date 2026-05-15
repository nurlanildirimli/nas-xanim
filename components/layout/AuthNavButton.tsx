"use client";

import Link from "next/link";
import { Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function AuthNavButton() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Button variant="ghost" size="icon" aria-label="Hesab yüklənir" className="hidden sm:inline-flex">
        <Loader2 className="animate-spin" />
      </Button>
    );
  }

  return (
    <Button asChild variant="ghost" size="icon" aria-label="Hesab" className="hidden sm:inline-flex">
      <Link href={user ? "/account" : "/login"}>
        <User />
      </Link>
    </Button>
  );
}
