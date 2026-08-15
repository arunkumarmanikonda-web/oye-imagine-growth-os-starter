'use client'

import React, { useState } from "react";

type RegenerateButtonProps = {
  pilotId: string;
};

export function RegenerateButton({ pilotId }: RegenerateButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleClick() {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/execution-plan/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pilotId }),
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate execution plan draft.");
      }

      window.location.reload();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to regenerate execution plan draft.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Regenerating..." : "Regenerate draft"}
      </button>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}