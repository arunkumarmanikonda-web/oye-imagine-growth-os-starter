'use client'

import React from "react";

import { useState } from "react";

type RegenerateButtonProps = {
  pilotId: string;
};

export function RegenerateButton({ pilotId }: RegenerateButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/whatsapp/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ pilotId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(payload?.error ?? "Unable to regenerate WhatsApp draft.");
      }

      window.location.reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to regenerate WhatsApp draft.";
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting}
      className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? "Regenerating..." : "Regenerate draft"}
    </button>
  );
}