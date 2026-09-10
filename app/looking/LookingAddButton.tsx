"use client";

import { Loader2, Plus, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthCallbackRedirectTo } from "../authRedirect";
import { supabase } from "../supabase";

export default function LookingAddButton({ language, compact = false }: { language: "en" | "pl"; compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const t = language === "pl" ? { add: "+ Dodaj, czego szukam", login: "Załóż konto / Zaloguj się" } : { add: "+ Post a request", login: "Create account / Sign in" };
  const destination = language === "pl" ? "/looking/add" : "/en/looking/add";
  useEffect(() => { void supabase.auth.getSession().then(({ data: { session } }) => setIsAuthenticated(Boolean(session?.user))); }, []);
  async function handleClick() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) { router.push(destination); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: getAuthCallbackRedirectTo(destination) } });
    if (error) { console.error("Could not start sign in", error); setLoading(false); }
  }
  if (compact && isAuthenticated) return null;
  return <button type="button" onClick={() => void handleClick()} disabled={loading} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-60 ${compact ? "border border-[#D8CCE7] text-[#7438B7]" : "bg-[#7438B7] text-white shadow-[0_14px_30px_rgba(116,56,183,0.24)]"}`}>
    {loading ? <Loader2 size={17} className="animate-spin" /> : compact ? <UserRound size={17} /> : <Plus size={17} />}{compact ? t.login : t.add}
  </button>;
}
