"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

type UseAuthOptions = {
  onUser?: (user: User) => void;
};

export function useAuth(options: UseAuthOptions = {}) {
  const auth = useMemo(() => getFirebaseAuth(), []);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const onUserRef = useRef(options.onUser);

  useEffect(() => {
    onUserRef.current = options.onUser;
  }, [options.onUser]);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        onUserRef.current?.(currentUser);
      }
    });
  }, [auth]);

  async function logout() {
    await signOut(auth);
  }

  return {
    auth,
    user,
    loading,
    logout,
  };
}
