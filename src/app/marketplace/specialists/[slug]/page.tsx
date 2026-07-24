import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MarketplaceSpecialistDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("marketplace_specialists")
    .select(
      "id, slug, full_name, title, primary_category, bio, skills, languages, verified",
    )
    .eq("active", true)
    .eq("slug", slug)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  const specialist = Array.isArray(data) && data.length > 0 ? data[0] : null;

  if (!specialist) {
    notFound();
  }

  return (
    <main className="min-h-screen text-slate-900">
      <section className="oi-shell py-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/marketplace"
            className="oi-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
          >
            ← Back to marketplace
          </Link>

          <section className="oi-card mt-6 overflow-hidden px-8 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-600">
                  {specialist.primary_category}
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  {specialist.full_name}
                </h1>
                <p className="mt-3 text-lg text-slate-600">{specialist.title}</p>
              </div>

              {specialist.verified ? (
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Verified specialist
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Emerging specialist
                </span>
              )}
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="oi-card-soft p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
                    Profile
                  </p>
                  <p className="mt-4 text-base leading-8 text-slate-700">
                    {specialist.bio}
                  </p>
                </div>

                <div className="mt-6 rounded-3xl border border-indigo-100 bg-indigo-50/70 p-6">
                  <p className="text-sm font-semibold text-indigo-700">
                    Marketplace assignment
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    This specialist can be assigned through the{" "}
                    <strong>Oye !magine</strong> marketplace workflow for governed
                    execution delivery.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="oi-card-soft p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Skills
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {specialist.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="oi-card-soft p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Languages
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {specialist.languages.map((language: string) => (
                      <span
                        key={language}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="oi-card-soft p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Quick summary
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="oi-chip px-3 py-2">
                      {specialist.primary_category}
                    </span>
                    <span className="oi-chip px-3 py-2">
                      {specialist.skills.length} skills
                    </span>
                    <span className="oi-chip px-3 py-2">
                      {specialist.languages.length} languages
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}