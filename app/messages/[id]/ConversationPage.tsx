"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Send, UserRound } from "lucide-react";
import { getProfileAvatarUrl } from "../../profileAvatars";
import { supabase } from "../../supabase";

type Message = {
  id: number;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

type Conversation = {
  id: string;
  user_1: string;
  user_2: string;
};

type Profile = {
  user_id: string;
  username: string;
  avatar_url: string | null;
};

export default function ConversationPage({ id, language }: { id: string; language: "en" | "pl" }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const t = language === "pl"
    ? {
        back: "Wiadomości",
        account: "Konto",
        conversationWith: (username: string) => `Rozmowa z ${username}`,
        placeholder: "Napisz wiadomość…",
        send: "Wyślij wiadomość",
        login: "Zaloguj się, aby zobaczyć rozmowę.",
        error: "Nie udało się pobrać rozmowy.",
        sendError: "Nie udało się wysłać wiadomości.",
        loading: "Ładowanie…",
      }
    : {
        back: "Messages",
        account: "Account",
        conversationWith: (username: string) => `Conversation with ${username}`,
        placeholder: "Write a message…",
        send: "Send message",
        login: "Sign in to view this conversation.",
        error: "Could not load this conversation.",
        sendError: "Could not send the message.",
        loading: "Loading…",
      };

  const load = useCallback(async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setError(t.login);
      setLoading(false);
      return;
    }

    setUserId(session.user.id);
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, user_1, user_2")
      .eq("id", id)
      .maybeSingle();

    if (conversationError || !conversation) {
      console.error("Could not load conversation", { conversationId: id, error: conversationError });
      setError(t.error);
      setLoading(false);
      return;
    }

    const conversationRow = conversation as Conversation;
    const otherUserId = conversationRow.user_1 === session.user.id
      ? conversationRow.user_2
      : conversationRow.user_1;

    const [messagesResult, profileResult] = await Promise.all([
      supabase
        .from("messages")
        .select("id, sender_id, content, created_at, read_at")
        .eq("conversation_id", id)
        .order("created_at"),
      supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .eq("user_id", otherUserId)
        .maybeSingle(),
    ]);

    if (messagesResult.error) {
      console.error("Could not load conversation messages", { conversationId: id, error: messagesResult.error });
      setError(t.error);
      setLoading(false);
      return;
    }

    if (profileResult.error) {
      console.error("Could not load conversation participant profile", { conversationId: id, error: profileResult.error });
    }

    const profile = (profileResult.data ?? null) as Profile | null;
    setMessages((messagesResult.data ?? []) as Message[]);
    setOtherProfile(profile);
    setAvatarUrl(await getProfileAvatarUrl(profile?.avatar_url));

    const { error: markReadError } = await supabase.rpc("mark_conversation_read", {
      target_conversation_id: id,
    });
    if (markReadError) {
      console.error("Could not mark conversation as read", { conversationId: id, error: markReadError });
    }

    setLoading(false);
  // The translation object is derived exclusively from `language`.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, language]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = content.trim();
    if (!text || !userId) return;

    setSending(true);
    setError("");
    const { error: insertError } = await supabase
      .from("messages")
      .insert({ conversation_id: id, sender_id: userId, content: text });
    setSending(false);

    if (insertError) {
      console.error("Could not send message", { conversationId: id, error: insertError });
      setError(t.sendError);
      return;
    }

    setContent("");
    await load();
  }

  const backHref = language === "pl" ? "/messages" : "/en/messages";
  const profileHref = otherProfile?.username
    ? language === "pl"
      ? `/profile/${otherProfile.username}`
      : `/en/profile/${otherProfile.username}`
    : null;
  const username = otherProfile?.username ?? t.account;

  return (
    <main className="min-h-screen bg-[#F7F4FB] px-4 py-8 text-[#17142E] sm:px-6 sm:py-12">
      <section className="mx-auto max-w-3xl">
        <Link href={backHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#7438B7]">
          <ArrowLeft size={17} />
          {t.back}
        </Link>
        <div className="mt-4 rounded-2xl border border-[#E8E1F0] bg-white p-5 shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F4EEF9] text-[#7438B7]">
              {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound size={23} />}
            </div>
            {profileHref ? (
              <Link href={profileHref} className="min-w-0 hover:text-[#7438B7]">
                <h1 className="truncate text-2xl font-bold">{t.conversationWith(username)}</h1>
              </Link>
            ) : <h1 className="truncate text-2xl font-bold">{t.conversationWith(username)}</h1>}
          </div>

          {loading ? (
            <p className="mt-6 flex items-center gap-2 text-[#6E6582]">
              <Loader2 className="animate-spin" size={18} />
              {t.loading}
            </p>
          ) : (
            <>
              <div className="mt-6 grid gap-3">
                {messages.map((message) => (
                  <article key={message.id} className={`max-w-[85%] rounded-2xl p-3 text-sm leading-6 ${message.sender_id === userId ? "ml-auto bg-[#7438B7] text-white" : "bg-[#F4EEF9] text-[#332B4D]"}`}>
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <time className="mt-1 block text-xs opacity-70">
                      {new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en-GB", { dateStyle: "short", timeStyle: "short" }).format(new Date(message.created_at))}
                    </time>
                  </article>
                ))}
              </div>
              <form onSubmit={submit} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="sr-only" htmlFor="message-content">{t.placeholder}</label>
                <textarea id="message-content" value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} required placeholder={t.placeholder} className="min-h-12 w-full resize-y rounded-xl border border-[#DED6EA] px-4 py-3 outline-none focus:border-[#A875D2]" />
                <button disabled={sending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white disabled:opacity-60">
                  {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                  {t.send}
                </button>
              </form>
            </>
          )}
          {error ? <p role="status" className="mt-4 text-sm text-red-700">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}
