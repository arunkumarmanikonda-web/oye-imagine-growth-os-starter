import type { LaunchChecklistSection, LaunchSignoffRecord } from '@/lib/launch/types';

type Props = {
  signoffs: LaunchSignoffRecord[];
  sections: Pick<LaunchChecklistSection, 'id' | 'title'>[];
};

export function LaunchSignoffTable({ signoffs, sections }: Props) {
  const sectionTitleById = Object.fromEntries(
    sections.map((section) => [section.id, section.title])
  ) as Record<string, string>;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Signoff table</h2>
          <p className="mt-2 text-sm text-slate-600">
            Most recent persisted signoff records for launch review.
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          Records: {signoffs.length}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Section</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Signer</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Signed at</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Evidence</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Digest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {signoffs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No signoff records saved yet.
                </td>
              </tr>
            ) : (
              signoffs.map((signoff) => (
                <tr key={`${signoff.sectionId}-${signoff.role}-${signoff.signerEmail}-${signoff.signedAtIso}`}>
                  <td className="px-4 py-3 text-slate-900">
                    {sectionTitleById[signoff.sectionId] ?? signoff.sectionId}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{signoff.role}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="font-medium text-slate-900">{signoff.signerName}</div>
                    <div className="text-xs text-slate-500">{signoff.signerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{signoff.signedAtIso}</td>
                  <td className="px-4 py-3 text-slate-700">{signoff.evidenceUrls.length}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {signoff.signatureDigest.slice(0, 16)}...
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}