"use client";

import { useEffect, useState } from "react";
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
        setErrorMessage(error.message);
      }
    }, 20000);

    async function finishLogin() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (!code) {
          throw new Error("Auth callback is missing the OAuth code parameter.");
        }

        const { error } = await withTimeout(
          supabase.auth.exchangeCodeForSession(code),
          15000,
          "Auth callback timed out while exchanging code.",
        );

        if (error) {
          console.error("Auth callback code exchange failed:", error);
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
          window.location.replace("/account");
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
      <div
        className={`flex items-center gap-3 rounded-2xl border border-[#E8E1F0] bg-white px-6 py-5 text-sm font-semibold shadow-[0_18px_55px_rgba(51,36,82,0.09)] ${
          errorMessage ? "text-transparent" : "text-[#6E6582]"
        }`}
      >
        {errorMessage ? (
          <span className="text-[#6E6582]">{errorMessage}</span>
        ) : (
          <Loader2 className="animate-spin text-[#7438B7]" size={20} />
        )}
        Kończymy logowanie...
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
    return error.message;
  }

  return "Nie udalo sie zakonczyc logowania.";
}
