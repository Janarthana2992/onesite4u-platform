import Link from "next/link";
import { ArrowRight, LayoutDashboard, PenLine, Sparkles } from "lucide-react";
import { EXAMPLE_PROFILES } from "@/data/profiles";
import { getDef } from "@/data/blocks";
import { SITE_HOST } from "@/lib/site";

export const metadata = {
  title: "OneSite4U — one link for your whole business",
  description:
    "Every page here is built from the same 41 blocks. Open any profile to see how differently they come out.",
};

/** The directory: every published profile, so nobody lands on a stranger's page. */
export default function HomePage() {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <header className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            <Sparkles size={13} /> OneSite4U
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            One link for your whole business.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-zinc-400 sm:text-lg">
            Every page below is built from the same 41 blocks — contact details, services, bookings,
            galleries, request desks, an assistant that answers from your own words. Open a few and see
            how differently they come out.
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLE_PROFILES.map((p) => {
            const { profile } = p.content;
            const live = p.content.blocks.filter((b) => b.visible).length;
            return (
              <Link
                key={p.id}
                href={`/${profile.handle}`}
                className="os-card group flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-500/50"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={profile.avatar}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{profile.name}</p>
                    <p className="truncate text-xs font-medium text-brand-600 dark:text-brand-300">
                      {p.field}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">{profile.city}</p>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-zinc-400">
                  {profile.tagline}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.highlights.slice(0, 3).map((h) => (
                    <span
                      key={h}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {getDef(h)?.label ?? h}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-zinc-800">
                  <span className="truncate text-slate-400">
                    {SITE_HOST}/{profile.handle}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-brand-600 transition-transform group-hover:translate-x-0.5 dark:text-brand-300">
                    Open <ArrowRight size={13} />
                  </span>
                </div>
                <span className="sr-only">{live} blocks on this page</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-2.5 border-t border-slate-200 pt-8 dark:border-zinc-800">
          <Link
            href="/me"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            <Sparkles size={15} /> Your own page
          </Link>
          <Link
            href="/webview"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <PenLine size={15} /> Page editor
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <LayoutDashboard size={15} /> Dashboard
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Demo build · no backend, no login. Every form simulates a request and says so.
        </p>
      </div>
    </div>
  );
}
