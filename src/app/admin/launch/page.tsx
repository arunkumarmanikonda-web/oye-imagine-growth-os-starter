import type { Metadata } from 'next';
import { LaunchChecklistBoard } from '@/components/admin/LaunchChecklistBoard';
import { LaunchSignoffForm } from '@/components/admin/LaunchSignoffForm';
import { LaunchSignoffTable } from '@/components/admin/LaunchSignoffTable';
import { launchChecklistSections, summarizeChecklist } from '@/lib/launch/checklist-seed';
import { listLaunchSignoffs, getLaunchSignoffStorePath } from '@/lib/launch/signoff-store';
import { launchAttestationText, legallyBindingFields } from '@/lib/launch/signoff-statement';
import { submitLaunchSignoff } from './actions';

export const metadata: Metadata = {
  title: 'Admin | Launch Checklist',
  description: 'Final public-shell launch QA checklist, evidence map, and signoff scaffold.',
};

function buildCoverage() {
  return launchChecklistSections.map((section) => {
    const requiredRoles = section.signoffRoles;
    return {
      sectionId: section.id,
      title: section.title,
      requiredRoles,
    };
  });
}

export default async function AdminLaunchChecklistPage() {
  const summary = summarizeChecklist(launchChecklistSections);
  const signoffs = await listLaunchSignoffs();
  const coverageSeed = buildCoverage();

  const signoffCoverage = coverageSeed.map((section) => {
    const completedRoles = Array.from(
      new Set(
        signoffs
          .filter((signoff) => signoff.sectionId === section.sectionId)
          .map((signoff) => signoff.role)
      )
    );

    const missingRoles = section.requiredRoles.filter(
      (role) => !completedRoles.includes(role)
    );

    return {
      ...section,
      completedRoles,
      missingRoles,
    };
  });

  const requiredSlots = signoffCoverage.reduce(
    (sum, section) => sum + section.requiredRoles.length,
    0
  );

  const completedSlots = signoffCoverage.reduce(
    (sum, section) => sum + section.completedRoles.length,
    0
  );

  const fullySignedSections = signoffCoverage.filter(
    (section) => section.missingRoles.length === 0
  ).length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700">
              UI24
            </span>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold tracking-wide text-rose-700">
              Launch blocking
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold tracking-wide text-amber-700">
              11B persistence
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
            Launch QA Checklist
          </h1>
          <p className="mt-4 max-w-3xl text-base text-slate-600">
            This admin surface consolidates launch evidence, signoff requirements, and outstanding blockers
            for the public-shell release. It is the review hub for UI01-UI23 and the staging ground for
            final go/no-go signoff.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-900">Current explicit blocker</div>
              <div className="mt-2 text-sm text-slate-700">
                UI18 accessibility remediation rerun remains open and must be cleared before final launch signoff.
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-900">Legally binding signoff record</div>
              <div className="mt-2 text-sm text-slate-700">
                Required fields: {legallyBindingFields.join(', ')}.
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-900">Signoff store path</div>
              <div className="mt-2 break-all text-sm text-slate-700">
                {getLaunchSignoffStorePath()}
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Legal attestation</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700">
            {launchAttestationText}
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stored signoffs</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{signoffs.length}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Required slots</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{requiredSlots}</div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Completed slots</div>
            <div className="mt-2 text-3xl font-semibold text-emerald-900">{completedSlots}</div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Sections fully signed</div>
            <div className="mt-2 text-3xl font-semibold text-amber-900">{fullySignedSections}</div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Signoff coverage</h2>
              <p className="mt-2 text-sm text-slate-600">
                Tracks required roles vs completed roles for each launch section.
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Section</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Required roles</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Completed roles</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Missing roles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {signoffCoverage.map((section) => (
                  <tr key={section.sectionId}>
                    <td className="px-4 py-3 font-medium text-slate-900">{section.title}</td>
                    <td className="px-4 py-3 text-slate-700">{section.requiredRoles.join(', ')}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {section.completedRoles.length ? section.completedRoles.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {section.missingRoles.length ? section.missingRoles.join(', ') : 'Complete'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-8">
          <LaunchChecklistBoard sections={launchChecklistSections} summary={summary} />
        </div>

        <div className="mt-8">
          <LaunchSignoffForm
            sections={launchChecklistSections.map((section) => ({
              id: section.id,
              title: section.title,
              signoffRoles: section.signoffRoles,
            }))}
            action={submitLaunchSignoff}
          />
        </div>

        <div className="mt-8">
          <LaunchSignoffTable
            signoffs={signoffs}
            sections={launchChecklistSections.map((section) => ({
              id: section.id,
              title: section.title,
            }))}
          />
        </div>
      </div>
    </main>
  );
}