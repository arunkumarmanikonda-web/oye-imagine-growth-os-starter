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

      const response = await fetch("/api/admin/landing-page/generate", {
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
            : "Failed to regenerate landing page brief.";
        throw new Error(errorMessage);
      }

      setStatus("success");
      setMessage("Landing page brief regenerated.");
      window.location.reload();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "Failed to regenerate landing page brief.",
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
        {status === "loading" ? "Regenerating..." : "Regenerate landing page"}
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