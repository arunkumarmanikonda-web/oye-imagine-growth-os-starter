"use client";

import { useFormStatus } from "react-dom";

type Props = {
  idleLabel?: string;
  pendingLabel?: string;
};

export default function AdminSaveButton({
  idleLabel = "Save changes",
  pendingLabel = "Saving...",
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="oi-editor-submit" disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}