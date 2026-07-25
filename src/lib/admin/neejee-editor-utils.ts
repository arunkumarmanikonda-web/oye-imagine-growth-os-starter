type StringMap = Record<string, unknown>;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readLines(formData: FormData, key: string) {
  return readString(formData, key)
    .replace(/`r`n/g, "\n")
    .replace(/`n/g, "\n")
    .replace(/\\n/g, "\n")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function listToMultiline(
  value: unknown,
  keys: string[] = ["title", "label", "name", "detail", "text"]
) {
  if (!Array.isArray(value)) return "";

  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (!item || typeof item !== "object") return "";
      for (const key of keys) {
        const candidate = (item as StringMap)[key];
        if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

export function buildOnboardingPatchFromFormData(formData: FormData) {
  const owner = readString(formData, "owner");
  const stageSummary = readString(formData, "stageSummary");
  const blockers = readLines(formData, "blockers").map((title, index) => ({
    id: `blocker-${index + 1}`,
    title,
    detail: title,
    status: "attention",
  }));
  const tasks = readLines(formData, "tasks").map((title, index) => ({
    id: `task-${index + 1}`,
    title,
    status: "todo",
  }));
  const services = readLines(formData, "services").map((label, index) => ({
    id: `service-${index + 1}`,
    label,
    status: "ready",
  }));
  const integrations = readLines(formData, "integrations").map((label, index) => ({
    id: `integration-${index + 1}`,
    label,
    status: "review_required",
  }));

  return {
    workspace: {
      owner,
      stageSummary,
    },
    blockers,
    tasks,
    services,
    integrations,
  };
}

export function buildBrandIntelligencePatchFromFormData(formData: FormData) {
  const profileStatus = readString(formData, "profileStatus");
  const essence = readString(formData, "essence");
  const approvedLanguage = readLines(formData, "approvedLanguage");
  const prohibitedLanguage = readLines(formData, "prohibitedLanguage");
  const audienceArchetypes = readLines(formData, "audienceArchetypes").map((title, index) => ({
    id: `audience-${index + 1}`,
    title,
  }));

  return {
    profileStatus,
    positioning: {
      essence,
    },
    approvedLanguage,
    prohibitedLanguage,
    audienceArchetypes,
  };
}

export function buildPilotPatchFromFormData(formData: FormData) {
  const owner = readString(formData, "owner");
  const executiveBrief = readLines(formData, "executiveBrief");
  const nextActionLabel = readString(formData, "nextActionLabel");
  const nextActionDetail = readString(formData, "nextActionDetail");
  const nextActionHref = readString(formData, "nextActionHref") || "/admin/pilot";

  const nextActions = nextActionLabel
    ? [
        {
          label: nextActionLabel,
          detail: nextActionDetail,
          href: nextActionHref,
          tone: "primary",
        },
      ]
    : [];

  return {
    workspace: {
      owner,
    },
    executiveBrief,
    nextActions,
  };
}