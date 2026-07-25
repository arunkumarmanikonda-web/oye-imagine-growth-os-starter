"use client";

import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  publish_confirmation_required: "Tick the publish confirmation box before publishing.",
  save_failed: "We couldn’t save the changes. Please try again.",
};

export function FormFlash() {
  const searchParams = useSearchParams();

  const saved = searchParams.get("saved") === "1";
  const published = searchParams.get("published") === "1";
  const error = searchParams.get("error");

  if (!saved && !published && !error) return null;

  const variant = error ? "error" : "success";
  const message = error
    ? ERROR_MESSAGES[error] ?? "Something went wrong while saving."
    : published
      ? "Changes published successfully."
      : "Draft saved successfully.";

  return (
    <div
      className={`admin-form-flash admin-form-flash--${variant}`}
      role={error ? "alert" : "status"}
    >
      {message}
    </div>
  );
}