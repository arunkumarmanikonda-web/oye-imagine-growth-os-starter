import { AuthFormShell } from "@/components/foundation/public-shell";
import { buildSupportStripModel } from "@/lib/foundation/public-shell";

export default function ClientLoginPage() {
  const support = buildSupportStripModel();

  return (
    <AuthFormShell
      lane="client"
      eyebrow="Client access"
      title="Client dashboard entry"
      summary="Client reporting, invoices, agreements, ledgers, support threads, and future AI concierge access."
      supportEmail={support.primaryEmail}
      supportPhone={support.primaryPhone}
      helpHref="mailto:hello@oyeimagine.com?subject=Client%20Access"
      helpLabel="Request client access"
      redirectTo="/client"
    />
  );
}