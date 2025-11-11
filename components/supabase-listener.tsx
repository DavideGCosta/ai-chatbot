"use client";

import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSupabase } from "./supabase-provider";

export function SupabaseSessionListener() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, _session: Session | null) => {
        router.refresh();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  return null;
}
