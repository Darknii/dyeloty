"use client";

import { Loader2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "./supabase";

type Props = { recipientId: string | null; language: "en" | "pl"; className?: string };

export default function StartConversationButton({ recipientId, language, className = "" }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const t = language === "pl"
    ? { label: "Napisz wiadomość", login: "Zaloguj się, aby wysłać wiadomość.", self: "Nie możesz napisać do siebie.", error: "Nie udało się otworzyć rozmowy." }
    : { label: "Send message", login: "Sign in to send a message.", self: "You cannot message yourself.", error: "Could not open the conversation." };

  async function handleClick() {
    setMessage("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setMessage(t.login);
      router.push(language === "pl" ? "/account" : "/en/account");
      return;
    }
    if (!recipientId || recipientId === session.user.id) {
      setMessage(t.self);
      return;
    }
    setIsLoading(true);
    const [user_1, user_2] = [session.user.id, recipientId].sort();
    const filter = `and(user_1.eq.${user_1},user_2.eq.${user_2})`;
    let { data: conversation, error } = await supabase
      .from("conversations").select("id").or(filter).maybeSingle();
    if (!conversation && !error) {
      const created = await supabase.from("conversations").insert({ user_1, user_2 }).select("id").single();
      conversation = created.data;
      error = created.error;
      if (error?.code === "23505") {
        const retry = await supabase.from("conversations").select("id").or(filter).maybeSingle();
        conversation = retry.data;
        error = retry.error;
      }
    }
    setIsLoading(false);
    if (error || !conversation) { setMessage(t.error); return; }
    router.push(language === "pl" ? `/messages/${conversation.id}` : `/en/messages/${conversation.id}`);
  }

  return <div className={className}>
    <button type="button" onClick={() => void handleClick()} disabled={isLoading || !recipientId} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7438B7] px-4 text-sm font-semibold text-white transition hover:bg-[#622CA2] disabled:cursor-not-allowed disabled:opacity-60">
      {isLoading ? <Loader2 size={17} className="animate-spin" /> : <MessageCircle size={17} />}{t.label}
    </button>
    {message ? <p role="status" className="mt-2 text-sm text-[#6E6582]">{message}</p> : null}
  </div>;
}
