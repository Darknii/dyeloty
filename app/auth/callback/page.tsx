"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { supabase } from "../../supabase";

export default function AuthCallbackPage() {
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fallbackTimeoutId = window.setTimeout(() => {
      const error = new Error("Auth callback timeout.");

      console.error("Auth callback failed:", error);

      if (isMounted) {
        setErrorMessage(getAuthErrorMessage(error));
      }
    }, 20000);

    async function finishLogin() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const oauthError = url.searchParams.get("error");
        const requestedPath = url.searchParams.get("next");
        const nextPath = getSafeNextPath(requestedPath);

        if (oauthError) {
          throw new Error("OAuth provider returned an error.");
        }

        if (!code) {
          throw new Error("Auth callback is missing the OAuth code parameter.");
        }

        const { error } = await withTimeout(
          supabase.auth.exchangeCodeForSession(code),
          15000,
          "Auth callback timed out while exchanging code.",
        );

        if (error) {
          console.error("Auth callback code exchange failed.", { message: error.message });
          throw error;
        }

        const {
          data: { session },
          error: sessionError,
        } = await withTimeout(
          supabase.auth.getSession(),
          10000,
          "Auth callback timed out while reading the session.",
        );

        if (sessionError) {
          console.error("Auth callback session read failed:", sessionError);
          throw sessionError;
        }

        if (!session) {
          throw new Error("Session missing after exchange");
        }

        if (isMounted) {
          window.clearTimeout(fallbackTimeoutId);
          window.location.replace(nextPath);
        }
      } catch (error) {
        console.error("Auth callback failed:", error);

        if (isMounted) {
          window.clearTimeout(fallbackTimeoutId);
          setErrorMessage(getAuthErrorMessage(error));
        }
      }
    }

    void finishLogin();

    return () => {
      isMounted = false;
      window.clearTimeout(fallbackTimeoutId);
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F4FB] px-4 text-[#17142E]">
      <div className="rounded-2xl border border-[#E8E1F0] bg-white px-6 py-5 text-sm font-semibold shadow-[0_18px_55px_rgba(51,36,82,0.09)]">
        {errorMessage ? (
          <div className="max-w-sm text-center">
            <h1 className="text-lg font-bold text-[#17142E]">
              Nie udało się dokończyć logowania.
            </h1>
            <p className="mt-2 font-normal leading-6 text-[#6E6582]">
              Spróbuj zalogować się ponownie. Jeśli problem wróci, odśwież stronę i rozpocznij logowanie od nowa.
            </p>
            <p className="mt-2 text-xs font-normal text-[#8A7A9D]">
              Szczegóły błędu są zapisane w konsoli: {errorMessage}
            </p>
            <Link
              href="/account"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.24)] transition hover:bg-[#622CA2]"
            >
              Wróć do logowania
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-[#6E6582]">
            <Loader2 className="animate-spin text-[#7438B7]" size={20} />
            Kończymy logowanie...
          </div>
        )}
      </div>
    </main>
  );
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);

    promise.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message || "Nie udało się dokończyć logowania.";
  }

  return "Nie udało się dokończyć logowania.";
}

function getSafeNextPath(path: string | null) {
  if (["/account", "/en/account", "/looking/add", "/en/looking/add", "/users", "/en/users"].includes(path ?? "")) {
    return path!;
  }

  if (/^\/(?:en\/)?profile\/[a-z0-9_]{3,30}$/i.test(path ?? "")) {
    return path!;
  }

  return "/account";
}
