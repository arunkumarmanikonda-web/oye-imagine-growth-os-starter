import { AuthFormShell } from "@/components/foundation/public-shell";
import { buildSupportStripModel } from "@/lib/foundation/public-shell";

export default function AdminLoginPage() {
  const support = buildSupportStripModel();

  return (
    <AuthFormShell
      lane="admin"
      eyebrow="Admin workspace"
      title="Admin and operator access"
      summary="CMS control, legal identity, workspace operations, support management, and role-based protected routing foundation."
      supportEmail={support.primaryEmail}
      supportPhone={support.primaryPhone}
      helpHref="mailto:hello@oyeimagine.com?subject=Admin%20Workspace%20Access"
      helpLabel="Request admin access"
      redirectTo="/admin"
    />
  );
}