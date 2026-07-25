export type EditorIntent = "save" | "publish";

export const PUBLISH_CONFIRMATION_ERROR = "publish_confirmation_required";
export const GENERIC_SAVE_ERROR = "save_failed";

export function readEditorIntent(formData: FormData): EditorIntent {
  const raw = String(formData.get("intent") ?? "save").trim().toLowerCase();
  return raw === "publish" ? "publish" : "save";
}

export function readPublishConfirmation(formData: FormData): boolean {
  return String(formData.get("confirmPublish") ?? "").trim().toLowerCase() === "yes";
}

export function assertPublishConfirmed(formData: FormData): void {
  if (readEditorIntent(formData) === "publish" && !readPublishConfirmation(formData)) {
    throw new Error(PUBLISH_CONFIRMATION_ERROR);
  }
}

export function buildEditorRedirect(
  path: string,
  state: "saved" | "published" | "error",
  message?: string
): string {
  const params = new URLSearchParams();

  if (state === "saved") params.set("saved", "1");
  if (state === "published") params.set("published", "1");
  if (state === "error") params.set("error", message?.trim() || GENERIC_SAVE_ERROR);

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function toEditorErrorSlug(error: unknown): string {
  const message =
    error instanceof Error ? error.message.trim() : String(error ?? "").trim();

  if (!message) return GENERIC_SAVE_ERROR;
  if (message === PUBLISH_CONFIRMATION_ERROR) return PUBLISH_CONFIRMATION_ERROR;
  return GENERIC_SAVE_ERROR;
}

/* M13J_GENERIC_EDITOR_INTENT_ALIASES_START */
export type WorkspaceEditorIntent = EditorIntent;

export const readWorkspaceEditorIntent = readEditorIntent;
export const readWorkspacePublishConfirmation = readPublishConfirmation;
export const assertWorkspacePublishConfirmed = assertPublishConfirmed;
export const buildWorkspaceEditorRedirect = buildEditorRedirect;
export const toWorkspaceEditorErrorSlug = toEditorErrorSlug;
/* M13J_GENERIC_EDITOR_INTENT_ALIASES_END */
