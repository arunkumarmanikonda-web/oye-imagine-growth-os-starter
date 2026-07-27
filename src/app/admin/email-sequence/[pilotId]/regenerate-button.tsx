"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface RegenerateButtonProps {
  pilotId: string;
}

export default function RegenerateButton({
  pilotId,
}: RegenerateButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");

  async function handleClick() {
    setErrorMessage("");

    const response = await fetch("/api/admin/email-sequence/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pilotId }),
    });

    if (!response.ok) {
      let message = "Failed to regenerate email sequence draft.";

      try {
        const payload = (await response.json()) as { error?: string };
        if (payload?.error) {
          message = payload.error;
        }
      } catch {
        // Ignore JSON parsing errors and fall back to default message.
      }

      setErrorMessage(message);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Regenerating..." : "Regenerate draft"}
      </button>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}