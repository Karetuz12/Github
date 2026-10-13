import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getContent, isRoomSlug, roomPage, ROOM_SLUGS } from "@/lib/content";
import type { RequestConfig } from "@/lib/requests";
import { BottomBar, Footer, Hero, Notice, QuickInfo, TopBar } from "@/components/site/chrome";
import { SectionNav } from "@/components/site/section-nav";
import { AccordionSection, AuroraSection, CardsSection, FeatureSection, HelpSection, ProgrammeSection } from "@/components/site/blocks";
import { ActivitiesSection, BokunTickets } from "@/components/site/activities";
import { RequestProvider } from "@/components/site/request-dialog";
import { BookingProvider } from "@/components/site/booking-dialog";
import { mcpConfigured } from "@/lib/bokun-mcp";

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return ROOM_SLUGS.map((room) => ({ room }));
}

export async function generateMetadata({ params }: PageProps<"/[room]">): Promise<Metadata> {
  const { room } = await params;
  const c = await getContent();
  const r = c.rooms.find((x) => x.slug === room);
  return {
    title: r ? `Your ${r.name}` : "Room information",
    // "Add to Home Screen" avaa oman huoneen sivun; iPhonella revontuli-ilmoitukset vaativat tämän.
    manifest: `/manifest/${room}`,
    appleWebApp: { capable: true, title: "SkyView", statusBarStyle: "default" },
  };
}

export default async function RoomPage({ params }: PageProps<"/[room]">) {
  const { room: slug } = await params;
  if (!isRoomSlug(slug)) notFound();
  const content = await getContent();
  const page = roomPage(content, slug);
  if (!page) notFound();
  const { room, settings, sections, programme, activities } = page;

  const config: RequestConfig = {
    breakfastPrice: settings.breakfastPrice,
    breakfastWindow: settings.breakfastWindow,
    breakfastCutoff: settings.breakfastCutoff,
    auraFrom: settings.auraFrom,
    auraTo: settings.auraTo,
    activityOptions: activities?.items.map((a) => a.title) ?? [],
    roomNoun: room.noun,
  };

  // Osiot järjestyksessä; programme/activities-paikkamerkit piirtävät omat dokumenttinsa.
  const rendered = sections.filter(
    (s) => (s.kind !== "programme" || programme) && (s.kind !== "activities" || activities?.items.length),
  );
  const navLinks = rendered.map((s) => ({ id: s.id, label: s.kind === "accordion" ? `Your ${room.noun}` : s.nav }));

  return (
    <RequestProvider config={config} whatsapp={settings.whatsapp} receptionCall={settings.receptionCall} wifiPassword={settings.wifiPassword}>
      <BookingProvider enabled={mcpConfigured() && Boolean(process.env.BOKUN_CHANNEL_UUID)} room={slug}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-green focus:px-4 focus:py-2 focus:text-warm">
        Skip to content
      </a>
      <TopBar room={room} settings={settings} />
      <Notice text={settings.notice} tone={settings.noticeTone} />
      <main id="main">
        <Hero room={room} settings={settings} />
        <QuickInfo settings={settings} />
        <SectionNav links={navLinks} />
        {rendered.map((s, i) => {
          const n = i + 1;
          switch (s.kind) {
            case "cards":
              return <CardsSection key={s.id} s={s} n={n} />;
            case "accordion":
              return <AccordionSection key={s.id} s={s} n={n} floorPlan={room.floorPlan} />;
            case "feature":
              return <FeatureSection key={s.id} s={s} n={n} extra={s.bokunProducts?.length ? <BokunTickets tickets={s.bokunProducts} /> : null} />;
            case "programme":
              return programme && <ProgrammeSection key={s.id} p={programme} n={n} />;
            case "activities":
              return activities && <ActivitiesSection key={s.id} a={activities} n={n} settings={settings} />;
            case "aurora":
              return <AuroraSection key={s.id} s={s} n={n} />;
            case "help":
              return <HelpSection key={s.id} s={s} n={n} settings={settings} />;
          }
        })}
      </main>
      <Footer room={room} />
      <BottomBar settings={settings} />
      </BookingProvider>
    </RequestProvider>
  );
}
