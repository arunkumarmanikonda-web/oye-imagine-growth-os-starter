import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MarketplaceSpecialistDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("marketplace_specialists")
    .select("id, slug, full_name, title, primary_category, bio, skills, languages, verified")
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
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/marketplace"
          className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-300 transition hover:border-white/20 hover:text-white"
        >
          ← Back to marketplace
        </Link>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-fuchsia-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-fuchsia-300">
                {specialist.primary_category}
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight">{specialist.full_name}</h1>
              <p className="mt-2 text-lg text-neutral-300">{specialist.title}</p>
            </div>

            {specialist.verified ? (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-emerald-200">
                Verified specialist
              </span>
            ) : (
              <span className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-neutral-400">
                Emerging specialist
              </span>
            )}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-2xl font-semibold">Profile</h2>
              <p className="mt-4 text-base leading-8 text-neutral-300">{specialist.bio}</p>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Skills</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {specialist.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Languages</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {specialist.languages.map((language: string) => (
                    <span
                      key={language}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs text-neutral-300"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-5">
                <p className="text-sm text-fuchsia-100">
                  This specialist can be assigned through the Oye !magine marketplace admin workflow.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}