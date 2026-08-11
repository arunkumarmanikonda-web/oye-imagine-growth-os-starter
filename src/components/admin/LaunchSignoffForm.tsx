import type { LaunchChecklistSection, LaunchRole } from '@/lib/launch/types';

type Props = {
  sections: Pick<LaunchChecklistSection, 'id' | 'title' | 'signoffRoles'>[];
  action: (formData: FormData) => void | Promise<void>;
};

const launchRoles: LaunchRole[] = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Legal',
  'Operations',
];

export function LaunchSignoffForm({ sections, action }: Props) {
  return (
    <form action={action} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Record launch signoff</h2>
        <p className="mt-2 text-sm text-slate-600">
          Adds or replaces the latest signoff for the same section, role, and signer email.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-800">
          <span>Section</span>
          <select
            name="sectionId"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
            defaultValue={sections[0]?.id ?? ''}
            required
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-800">
          <span>Role</span>
          <select
            name="role"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
            defaultValue="Engineering"
            required
          >
            {launchRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-800">
          <span>Signer name</span>
          <input
            name="signerName"
            type="text"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
            placeholder="Full name"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-800">
          <span>Signer email</span>
          <input
            name="signerEmail"
            type="email"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
            placeholder="name@company.com"
            required
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-slate-800">
        <span>Evidence URLs</span>
        <textarea
          name="evidenceUrls"
          rows={5}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
          placeholder="One URL per line or comma-separated"
          required
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-slate-800">
        <span>Notes</span>
        <textarea
          name="notes"
          rows={4}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
          placeholder="Scope, exceptions, legal notes, or launch caveats"
        />
      </label>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        This signoff records the legally binding attestation text and generates a SHA-256 signature digest.
      </div>

      <button
        type="submit"
        className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Save signoff record
      </button>
    </form>
  );
}