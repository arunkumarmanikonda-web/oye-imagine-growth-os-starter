"use client";

import React, { useState } from "react";

type Props = {
  pilotId: string;
};

export default function RegenerateStrategyButton({ pilotId }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRegenerate() {
    try {
      setLoading(true);
      setMessage(null);
      setError(null);

      const response = await fetch("/api/admin/strategy/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ pilotId }),
      });

      const json = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !json.ok) {
        throw new Error(json.error || "Failed to regenerate strategy.");
      }

      setMessage("Strategy brief regenerated.");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        className="oi-button-primary disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        onClick={() => void handleRegenerate()}
        type="button"
      >
        {loading ? "Regenerating..." : "Regenerate strategy"}
      </button>

      {message ? (
        <p className="text-sm font-medium text-emerald-700">{message}</p>
      ) : null}

      {error ? (
        <p className="text-sm font-medium text-rose-700">{error}</p>
      ) : null}
    </div>
  );
}