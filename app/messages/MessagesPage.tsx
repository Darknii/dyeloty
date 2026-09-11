"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Loader2, MessageCircle, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfileAvatarUrl } from "../profileAvatars";
import { supabase } from "../supabase";

type Conversation = {
  id: string;
  user_1: string;
  user_2: string;
  created_at: string;
};

type Message = {
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

type Profile = {
  user_id: string;
  username: string;
  avatar_url: string | null;
};

type ConversationItem = {
  conversation: Conversation;
  otherProfile: Profile | null;
  avatarUrl: string | null;
  lastMessage: Message | null;
  unreadCount: number;
  isLastMessageOwn: boolean;
};

function formatMessageTime(value: string, language: "en" | "pl") {
  const date = new Date(value);
  const today = new Date();
  const locale = language === "pl" ? "pl-PL" : "en-GB";
  const isToday = date.toDateString() === today.toDateString();

  return new Intl.DateTimeFormat(
    locale,
    isToday
      ? { hour: "2-digit", minute: "2-digit" }
      : { day: "2-digit", month: "short" },
  ).format(date);
}

export default function MessagesPage({ language }: { language: "en" | "pl" }) {
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const t = language === "pl"
    ? {
        title: "Wiadomości",
        intro: "Twoje rozmowy w Dyeloty.",
        login: "Zaloguj się, aby zobaczyć wiadomości.",
        empty: "Nie masz jeszcze rozmów.",
        error: "Nie udało się pobrać rozmów.",
        noMessages: "Brak wiadomości",
        you: "Ty: ",
        account: "Konto",
        unread: "Nieprzeczytane wiadomości",
      }
    : {
        title: "Messages",
        intro: "Your Dyeloty conversations.",
        empty: "You do not have any conversations yet.",
        error: "Could not load conversations.",
        noMessages: "No messages yet",
        you: "You: ",
        account: "Account",
        unread: "Unread messages",
      };

  useEffect(() => {
    let mounted = true;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (mounted) setLoading(false);
        return;
      }

      const { data: conversations, error: conversationsError } = await supabase
        .from("conversations")
        .select("id, user_1, user_2, created_at")
        .order("created_at", { ascending: false });

      if (conversationsError) {
        console.error("Could not load conversations", conversationsError);
        if (mounted) {
          setError(true);
          setLoading(false);
        }
        return;
      }

      const conversationRows = (conversations ?? []) as Conversation[];
      const conversationIds = conversationRows.map((conversation) => conversation.id);
      const otherUserIds = [...new Set(conversationRows.map((conversation) => (
        conversation.user_1 === session.user.id ? conversation.user_2 : conversation.user_1
      )))];

      const [messagesResult, profilesResult] = await Promise.all([
        conversationIds.length > 0
          ? supabase
              .from("messages")
              .select("conversation_id, sender_id, content, created_at, read_at")
              .in("conversation_id", conversationIds)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [] as Message[], error: null }),
        otherUserIds.length > 0
          ? supabase
              .from("profiles")
              .select("user_id, username, avatar_url")
              .in("user_id", otherUserIds)
          : Promise.resolve({ data: [] as Profile[], error: null }),
      ]);

      if (messagesResult.error) {
        console.error("Could not load conversation messages", messagesResult.error);
      }
      if (profilesResult.error) {
        console.error("Could not load conversation participant profiles", profilesResult.error);
      }

      const profilesByUserId = new Map(
        ((profilesResult.data ?? []) as Profile[]).map((profile) => [profile.user_id, profile]),
      );
      const latestByConversation = new Map<string, Message>();
      const unreadByConversation = new Map<string, number>();

      for (const message of (messagesResult.data ?? []) as Message[]) {
        if (!latestByConversation.has(message.conversation_id)) {
          latestByConversation.set(message.conversation_id, message);
        }
        if (message.read_at === null && message.sender_id !== session.user.id) {
          unreadByConversation.set(
            message.conversation_id,
            (unreadByConversation.get(message.conversation_id) ?? 0) + 1,
          );
        }
      }

      const baseItems = conversationRows.map((conversation) => {
        const otherUserId = conversation.user_1 === session.user.id
          ? conversation.user_2
          : conversation.user_1;
        const lastMessage = latestByConversation.get(conversation.id) ?? null;

        return {
          conversation,
          otherProfile: profilesByUserId.get(otherUserId) ?? null,
          avatarUrl: null,
          lastMessage,
          unreadCount: unreadByConversation.get(conversation.id) ?? 0,
          isLastMessageOwn: lastMessage?.sender_id === session.user.id,
        };
      });

      const itemsWithAvatars = await Promise.all(baseItems.map(async (item) => ({
        ...item,
        avatarUrl: await getProfileAvatarUrl(item.otherProfile?.avatar_url),
      })));

      itemsWithAvatars.sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return bTime - aTime;
      });

      if (mounted) {
        setItems(itemsWithAvatars);
        setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#6d5c66]" /></div>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl text-[#3e3038]">{t.title}</h1>
      <p className="mt-2 text-[#6d5c66]">{t.intro}</p>

      {error ? <p className="mt-8 rounded-2xl bg-red-50 p-5 text-red-800">{t.error}</p> : null}

      {!error && items.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-[#f7f1ed] p-8 text-center text-[#6d5c66]">
          <MessageCircle className="mx-auto mb-3 h-8 w-8" />
          {t.empty}
        </div>
      ) : null}

      <div className="mt-8 space-y-3">
        {items.map((item) => {
          const username = item.otherProfile?.username ?? t.account;
          const href = language === "pl"
            ? `/messages/${item.conversation.id}`
            : `/en/messages/${item.conversation.id}`;
          const preview = item.lastMessage
            ? `${item.isLastMessageOwn ? t.you : ""}${item.lastMessage.content}`
            : t.noMessages;

          return (
            <Link
              key={item.conversation.id}
              href={href}
              className="flex items-center gap-3 rounded-2xl border border-[#eadfd8] bg-white p-4 transition hover:border-[#c9b1a2] hover:bg-[#fffaf7]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f1e4dc] text-[#765c6a]">
                {item.avatarUrl ? <img src={item.avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-6 w-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`truncate text-[#3e3038] ${item.unreadCount > 0 ? "font-semibold" : "font-medium"}`}>{username}</p>
                  {item.unreadCount > 0 ? <span className="h-2 w-2 shrink-0 rounded-full bg-[#b9536b]" aria-label={t.unread} /> : null}
                </div>
                <p className={`mt-1 truncate text-sm ${item.unreadCount > 0 ? "font-medium text-[#4b3943]" : "text-[#7e6f77]"}`}>{preview}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 self-stretch">
                {item.lastMessage ? <span className="text-xs text-[#8b7b84]">{formatMessageTime(item.lastMessage.created_at, language)}</span> : null}
                {item.unreadCount > 0 ? <span className="rounded-full bg-[#f3dfe4] px-2 py-0.5 text-xs font-semibold text-[#9c3652]">{item.unreadCount > 9 ? "9+" : item.unreadCount}</span> : null}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
