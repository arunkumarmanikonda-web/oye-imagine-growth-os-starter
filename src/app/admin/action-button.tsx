'use client'

import { useFormStatus } from "react-dom";

type ActionButtonProps = {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  name?: string;
  value?: string;
};

export function ActionButton({
  label,
  pendingLabel = "Saving...",
  variant = "primary",
  name,
  value,
}: ActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={`admin-action-button admin-action-button--${variant}`}
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}