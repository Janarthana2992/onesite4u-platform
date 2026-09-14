"use client";

import { Fragment, useState, type ReactNode } from "react";
import { CalendarDays, Copy, Palette, QrCode } from "lucide-react";
import { type Job, type Service } from "@/data/mock";
import { getDef, type Block } from "@/data/blocks";
import { blockHasContent } from "@/lib/block-content";
import {
  ActionButtons,
  DesktopNav,
  EventSection,
  Footer,
  GallerySection,
  Header,
  HeroBanner,
  IdentityCard,
  JobsSection,
  LinksSection,
  NewsletterSection,
  QuickInfo,
  ServicesSection,
} from "@/components/profile-sections";
import {
  AssistantSection,
  ClientsSection,
  ExperienceSection,
  GrievanceSection,
  MilestonesSection,
  ReviewsSection,
} from "@/components/sections-extra";
import { SIMPLE_BLOCKS } from "@/components/blocks/simple-blocks";
import { BlockProvider } from "@/components/blocks/context";
import { ApplySheet, BookingSheet, Lightbox, QrSheet, RsvpSheet } from "@/components/sheets";
import { BottomNav } from "@/components/bottom-nav";
import { Customizer } from "@/components/customizer";
import { BlockFrame, DropIndicator, useEditor } from "@/components/editor";
import { Button, Card, SectionHeader, Sheet, cn } from "@/components/ui";
import { useToast } from "@/components/providers";
import { DesignScope, useDesign } from "@/components/design-store";
import { useContent } from "@/components/content-store";
import { useMediaQuery } from "@/lib/hooks";
import { FakeQr } from "@/components/fake-qr";
import { Reveal } from "@/components/reveal";

export type ProfileVariant = "auto" | "mobile" | "web";

export function ProfileView({
  variant = "auto",
  framed = false,
  showCustomize = false,
}: {
  variant?: ProfileVariant;
  framed?: boolean;
  showCustomize?: boolean;
}) {
  const { toast } = useToast();
  const { design, updateBlock } = useDesign();
  const { content } = useContent();
  const editor = useEditor();
  const { profile } = content;
  const isDesktopViewport = useMediaQuery("(min-width: 1024px)");
  const wide = variant === "web" || (variant === "auto" && isDesktopViewport);

  const [booking, setBooking] = useState<{ open: boolean; service: Service | null }>({ open: false, service: null });
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const openBooking = (service: Service | null = null) => setBooking({ open: true, service });

  const share = async () => {
    const data = { title: profile.name, text: profile.title, url: profile.url };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {}
    }
    navigator.clipboard?.writeText(profile.url).catch(() => {});
    toast("Profile link copied to clipboard");
  };

  /* ---------- block rendering ---------- */

  const renderBlock = (block: Block): ReactNode => {
    const def = getDef(block.type);
    if (!def) return null;
    switch (block.type) {
      case "quickInfo": return <QuickInfo wide={wide} />;
      case "links": return <LinksSection wide={wide} />;
      case "services": return <ServicesSection wide={wide} onBook={(s) => openBooking(s)} />;
      case "grievance": return <GrievanceSection wide={wide} />;
      case "milestones": return <MilestonesSection wide={wide} />;
      case "assistant": return <AssistantSection wide={wide} onBook={() => openBooking()} />;
      case "reviews": return <ReviewsSection wide={wide} />;
      case "experience": return <ExperienceSection wide={wide} />;
      case "clients": return <ClientsSection wide={wide} />;
      case "gallery": return <GallerySection wide={wide} onOpen={setLightbox} />;
      case "event": return <EventSection wide={wide} onRsvp={() => setRsvpOpen(true)} />;
      case "jobs": return <JobsSection wide={wide} onApply={setApplyJob} />;
      case "newsletter": return <NewsletterSection wide={wide} />;
    }
    const Simple = SIMPLE_BLOCKS[block.type];
    if (!Simple) return null;
    const title = String(block.props.title ?? "");
    const subtitle = String(block.props.subtitle ?? "");
    return (
      <section id={block.id} className="scroll-mt-4">
        {!def.noHeader && title.trim() && <SectionHeader title={title} subtitle={subtitle} wide={wide} />}
        <Simple wide={wide} onBook={() => openBooking()} />
      </section>
    );
  };

  // Live page: only visible, filled blocks. Editing: every block, so it can be selected and filled.
  const blocks = editor.enabled
    ? design.blocks
    : design.blocks.filter((b) => b.visible && blockHasContent(b, content));

  const body = (
    <>
      {editor.enabled && <DropIndicator index={0} />}
      {blocks.map((b, i) => {
        const inner = (
          <BlockProvider
            key={b.id}
            block={b}
            wide={wide}
            editing={editor.enabled && editor.selectedId === b.id}
            setProp={(key, value) => updateBlock(b.id, { [key]: value })}
          >
            {editor.enabled ? (
              <BlockFrame block={b} index={i} total={blocks.length} empty={!blockHasContent(b, content)}>
                {renderBlock(b)}
              </BlockFrame>
            ) : (
              renderBlock(b)
            )}
          </BlockProvider>
        );
        const node = editor.enabled ? inner : <Reveal key={b.id}>{inner}</Reveal>;
        return (
          <Fragment key={b.id}>
            {node}
            {editor.enabled && <DropIndicator index={i + 1} />}
          </Fragment>
        );
      })}
      {editor.enabled && blocks.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-zinc-700">
          Your page is empty. Drag a block here from the library.
        </div>
      )}
    </>
  );

  const sheets = (
    <>
      <BookingSheet open={booking.open} service={booking.service} onClose={() => setBooking((b) => ({ ...b, open: false }))} />
      <RsvpSheet open={rsvpOpen} onClose={() => setRsvpOpen(false)} />
      <ApplySheet job={applyJob} onClose={() => setApplyJob(null)} />
      <QrSheet open={qrOpen} onClose={() => setQrOpen(false)} />
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      <Sheet open={customizeOpen} onClose={() => setCustomizeOpen(false)} title="Customize design">
        <Customizer />
      </Sheet>
    </>
  );

  const deselect = () => editor.enabled && editor.select(null);

  /* ---------- desktop web page ---------- */

  if (wide) {
    return (
      <DesignScope className={cn("os-page bg-slate-50 dark:bg-zinc-950", framed ? "min-h-full" : "min-h-dvh")}>
        <div id="home" />
        <DesktopNav onBook={() => openBooking()} onShare={share} onQr={() => setQrOpen(true)} onCustomize={showCustomize ? () => setCustomizeOpen(true) : undefined} />
        <HeroBanner />
        <div className="mx-auto max-w-6xl px-6 pb-16" onClick={deselect}>
          <div className="grid grid-cols-[340px_minmax(0,1fr)] items-start gap-8">
            <aside className={cn("sticky top-20 space-y-4", design.showBanner && "-mt-32")}>
              <IdentityCard />
              <ActionButtons />
              <Button full size="lg" onClick={() => openBooking()}>
                <CalendarDays size={17} /> Book an appointment
              </Button>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 rounded-lg bg-white p-1 shadow-sm dark:bg-white"><FakeQr size={64} /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Share this profile</p>
                    <p className="truncate text-xs text-slate-500 dark:text-zinc-400">onesite4u.com/{profile.handle}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(profile.url).catch(() => {}); toast("Link copied"); }}>
                    <Copy size={14} /> Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setQrOpen(true)}><QrCode size={14} /> QR</Button>
                </div>
              </Card>
            </aside>
            <main className={cn("pt-8", editor.enabled ? "space-y-6" : "space-y-16")}>
              {body}
              <Footer />
            </main>
          </div>
        </div>
        {sheets}
      </DesignScope>
    );
  }

  /* ---------- mobile app view ---------- */

  return (
    <DesignScope framed={framed} className={cn("mx-auto max-w-md bg-slate-50 pb-28 dark:bg-zinc-950", framed ? "min-h-full" : "min-h-dvh shadow-2xl")}>
      <div id="home" />
      <Header onShare={share} onQr={() => setQrOpen(true)} onCustomize={showCustomize ? () => setCustomizeOpen(true) : undefined} />
      <main className={cn("px-5 pt-5", editor.enabled ? "space-y-5" : "space-y-9")} onClick={deselect}>
        <ActionButtons />
        {body}
        <Footer />
      </main>
      <BottomNav onBook={() => openBooking()} />
      {showCustomize && (
        <button onClick={() => setCustomizeOpen(true)} className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-xl shadow-brand-600/40 transition-transform active:scale-90" aria-label="Customize design">
          <Palette size={20} />
        </button>
      )}
      {sheets}
    </DesignScope>
  );
}

export { blockHasContent };
