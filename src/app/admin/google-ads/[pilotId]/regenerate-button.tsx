'use client'

import { useState } from "react";

type RegenerateButtonProps = {
  pilotId: string;
};

export function RegenerateButton({ pilotId }: RegenerateButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleClick() {
    try {
      setStatus("loading");
      setMessage("");

      const response = await fetch("/api/admin/google-ads/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          pilotId,
          forceRegenerate: true,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

      if (!response.ok) {
        const errorMessage =
          typeof payload.error === "string" && payload.error.trim().length > 0
            ? payload.error.trim()
            : "Failed to regenerate Google Ads draft.";
        throw new Error(errorMessage);
      }

      setStatus("success");
      setMessage("Google Ads draft regenerated.");
      window.location.reload();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "Failed to regenerate Google Ads draft.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        className="inline-flex w-fit items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Regenerating..." : "Regenerate Google Ads draft"}
      </button>

      {message ? (
        <p
          className={
            status === "error"
              ? "text-sm text-red-600"
              : "text-sm text-green-700"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}