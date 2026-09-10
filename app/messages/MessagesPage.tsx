"use client";

import Link from "next/link";
import { Loader2, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

type Conversation = { id: string; created_at: string };

export default function MessagesPage({ language }: { language: "en" | "pl" }) {
  const [items, setItems] = useState<Conversation[]>([]); const [unread, setUnread] = useState<Set<string>>(new Set()); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  const t = language === "pl" ? { title: "Wiadomości", intro: "Twoje rozmowy w Dyeloty.", login: "Zaloguj się, aby zobaczyć wiadomości.", empty: "Nie masz jeszcze rozmów.", error: "Nie udało się pobrać rozmów.", open: "Otwórz rozmowę", unread: "Nowa wiadomość" } : { title: "Messages", intro: "Your Dyeloty conversations.", login: "Sign in to view your messages.", empty: "You do not have any conversations yet.", error: "Could not load conversations.", open: "Open conversation", unread: "New message" };
  useEffect(() => { let mounted = true; async function load() { const { data: { session } } = await supabase.auth.getSession(); if (!session?.user) { if (mounted) setLoading(false); return; } const [{ data, error }, { data: unreadRows }] = await Promise.all([supabase.from("conversations").select("id, created_at").order("created_at", { ascending: false }), supabase.from("messages").select("conversation_id").is("read_at", null).neq("sender_id", session.user.id)]); if (!mounted) return; setItems(data ?? []); setUnread(new Set((unreadRows ?? []).map((row) => row.conversation_id))); setError(Boolean(error)); setLoading(false); } void load(); return () => { mounted = false; }; }, []);
  if (loading) return <PageShell><div className="flex items-center gap-3"><Loader2 className="animate-spin" />{language === "pl" ? "Ładowanie wiadomości..." : "Loading messages..."}</div></PageShell>;
  return <PageShell><h1 className="text-3xl font-bold">{t.title}</h1><p className="mt-2 text-[#6E6582]">{t.intro}</p>{error ? <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{t.error}</p> : items.length ? <div className="mt-6 grid gap-3">{items.map((item) => <Link key={item.id} href={language === "pl" ? `/messages/${item.id}` : `/en/messages/${item.id}`} className="flex min-h-14 items-center justify-between rounded-xl border border-[#E8E1F0] bg-white p-4 transition hover:bg-[#FAF8FC]"><span className="inline-flex items-center gap-2 font-semibold"><MessageCircle size={18} />{language === "pl" ? "Rozmowa" : "Conversation"}{unread.has(item.id) ? <span className="rounded-full bg-[#7438B7] px-2 py-0.5 text-xs text-white">{t.unread}</span> : null}</span><span className="text-sm text-[#6E6582]">{new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en-GB", { dateStyle: "medium" }).format(new Date(item.created_at))}</span></Link>)}</div> : <div className="mt-6 rounded-xl bg-[#FAF8FC] p-8 text-center text-[#6E6582]">{t.empty}</div>}</PageShell>;
}
function PageShell({ children }: { children: React.ReactNode }) { return <main className="min-h-screen bg-[#F7F4FB] px-4 py-8 text-[#17142E] sm:px-6 sm:py-12"><section className="mx-auto max-w-3xl rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-8">{children}</section></main>; }
