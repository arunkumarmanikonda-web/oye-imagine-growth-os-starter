'use client'

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type RegenerateButtonProps = {
  pilotId: string;
};

export function RegenerateButton({ pilotId }: RegenerateButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClick = () => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/execution-status/generate", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ pilotId }),
        });

        if (!response.ok) {
          throw new Error(`Regeneration failed with status ${response.status}`);
        }

        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to regenerate draft.";
        setErrorMessage(message);
      }
    });
  };

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={isPending}>
        {isPending ? "Regenerating..." : "Regenerate draft"}
      </button>
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}
    </div>
  );
}

export default RegenerateButton;