export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-xl space-y-8 py-10">
        <header className="space-y-3 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Operator login</div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Protected operator access</h1>
          <p className="text-sm text-neutral-600">
            Session-backed operator entry for content control, config command center and canonical workspace management.
          </p>
        </header>

        <form action="/api/auth/login" method="post" className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <input type="hidden" name="role" value="operator" />
          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-neutral-800">Operator email</span>
              <input
                name="email"
                type="email"
                required
                defaultValue="operator@oyeimagine.com"
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-0"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-neutral-800">Display name</span>
              <input
                name="displayName"
                type="text"
                defaultValue="Oye Operator"
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-0"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white"
            >
              Continue to operator dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}