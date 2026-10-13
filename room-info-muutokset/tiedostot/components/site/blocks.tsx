import type { Item, Programme, Section, Settings } from "@/lib/content/types";
import { Actions } from "./actions";
import { telLink, waLink } from "@/lib/requests";

/** Puhelinnumerot (+358 …) teksteissä klikattaviksi soittolinkeiksi. */
function linkPhones(text: string) {
  return text.split(/(\+\d[\d ]{6,}\d)/g).map((p, i) =>
    i % 2 ? (
      <a key={i} href={telLink(p)} className="whitespace-nowrap underline decoration-gold/60 underline-offset-4 hover:decoration-current">
        {p}
      </a>
    ) : (
      p
    ),
  );
}

/** Kappaleet tyhjällä rivillä, rivinvaihdot säilyvät, puhelinnumerot linkkeinä. */
export function Prose({ text, className = "" }: { text?: string; className?: string }) {
  if (!text) return null;
  return (
    <div className={`space-y-3 ${className}`}>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {linkPhones(p)}
        </p>
      ))}
    </div>
  );
}

export function Lines({ text }: { text: string }) {
  return <>{text.split("\n").map((l, i) => (i ? [<br key={i} />, l] : l))}</>;
}

export function SectionHead({ n, eyebrow, title, intro, tone = "light" }: { n: number; eyebrow: string; title: string; intro?: string; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <header className="max-w-2xl">
      <p className={`eyebrow flex items-center gap-3 ${dark ? "text-gold-soft" : "text-gold"}`}>
        <span className="tabular-nums">{String(n).padStart(2, "0")}</span>
        <span aria-hidden className={`h-3 w-px ${dark ? "bg-warm/30" : "bg-line"}`} />
        {eyebrow}
      </p>
      <h2 className={`display mt-4 text-[34px] sm:text-[44px] ${dark ? "text-warm" : "text-green"}`}>
        <Lines text={title} />
      </h2>
      {intro && <p className={`mt-4 text-[16px] ${dark ? "text-warm/75" : "text-muted"}`}>{intro}</p>}
    </header>
  );
}

function Card({ item, featured }: { item: Item; featured?: boolean }) {
  return (
    <article className={`flex flex-col rounded-2xl border p-6 sm:p-7 ${featured ? "border-green bg-green text-warm" : "border-line bg-paper"}`}>
      {item.eyebrow && <p className={`eyebrow ${featured ? "text-gold-soft" : "text-gold"}`}>{item.eyebrow}</p>}
      <h3 className={`mt-3 text-[20px] font-medium ${featured ? "text-warm" : "text-green"}`}>{item.title}</h3>
      {item.meta && (
        <p className="mt-3">
          <span className={`display block text-[34px] tabular-nums ${featured ? "text-warm" : "text-green"}`}>{item.meta}</span>
          {item.metaNote && <span className={`text-sm ${featured ? "text-warm/70" : "text-muted"}`}>{item.metaNote}</span>}
        </p>
      )}
      <Prose text={item.body} className={`mt-3 text-[15px] ${featured ? "text-warm/80" : "text-muted"}`} />
      <div className="mt-auto">
        <Actions actions={item.actions} first={featured ? "light" : "primary"} variant={featured ? "light" : undefined} />
      </div>
    </article>
  );
}

export function CardsSection({ s, n }: { s: Section; n: number }) {
  return (
    <section id={s.id} className="wrap py-16 sm:py-24">
      <SectionHead n={n} eyebrow={s.eyebrow} title={s.title} intro={s.intro} />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {s.items.map((it) => (
          <Card key={it.id} item={it} />
        ))}
      </div>
    </section>
  );
}

export function Accordion({ items }: { items: Item[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((it) => (
        <details key={it.id} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-medium text-green [&::-webkit-details-marker]:hidden">
            {it.title}
            <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-lg text-gold transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="max-w-2xl pb-6 text-[15px] text-muted">
            <Prose text={it.body} />
            <Actions actions={it.actions} variant="outline" />
          </div>
        </details>
      ))}
    </div>
  );
}

export function AccordionSection({ s, n, floorPlan }: { s: Section; n: number; floorPlan?: string }) {
  return (
    <section id={s.id} className="wrap py-16 sm:py-24">
      <div className={floorPlan ? "grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start" : ""}>
        <div>
          <SectionHead n={n} eyebrow={s.eyebrow} title={s.title} intro={s.intro} />
          <div className="mt-10">
            <Accordion items={s.items} />
          </div>
        </div>
        {floorPlan && (
          <figure className="overflow-hidden rounded-2xl bg-[#232323] lg:sticky lg:top-24">
            <img src={floorPlan} alt="Floor plan of the Aurora Cabin: entrance, bathroom, sauna, kitchenette, living and sleeping area, terrace with hot tub and storage." className="w-full" />
            <figcaption className="px-5 pb-4 text-xs text-warm/60">Your cabin · floor plan</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}

export function FeatureSection({ s, n, extra }: { s: Section; n: number; extra?: React.ReactNode }) {
  const it = s.items[0];
  return (
    <section id={s.id} className="py-6 sm:py-10">
      <div className="mx-auto max-w-[1240px] sm:px-5">
        <div className={`grid overflow-hidden bg-green text-warm sm:rounded-3xl ${s.image ? "lg:grid-cols-[1.1fr_1fr]" : ""}`}>
          <div className="px-5 py-14 sm:p-14">
            <SectionHead n={n} eyebrow={s.eyebrow} title={s.title} tone="dark" />
            {it && (
              <>
                <Prose text={it.body} className="mt-6 max-w-xl text-[15px] text-warm/80" />
                <Actions actions={it.actions} first="light" variant="light" />
              </>
            )}
            {extra}
            {s.footnote && <p className="mt-6 max-w-xl text-sm text-warm/60">{s.footnote}</p>}
          </div>
          {s.image && <img src={s.image} alt="" className="h-72 w-full object-cover lg:h-full" />}
        </div>
      </div>
    </section>
  );
}

export function ProgrammeSection({ p, n }: { p: Programme; n: number }) {
  return (
    <section id="programme" className="border-y border-line bg-sand/50">
      <div className="wrap py-16 sm:py-24">
        <SectionHead n={n} eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
        {p.comingSoon ? (
          <div className="mt-8 rounded-2xl border border-gold/40 bg-paper p-6 sm:p-8">
            <p className="eyebrow text-gold">Coming soon</p>
            {p.comingSoonText && <Prose text={p.comingSoonText} className="mt-3 max-w-2xl text-[15px] text-muted" />}
            {p.season && <p className="mt-3 text-sm text-muted">Programme season: {p.season}</p>}
          </div>
        ) : (
          <>
            <p className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-gold/40 bg-paper px-4 py-2 text-sm text-green">
              <span className="eyebrow text-gold">Free</span>
              {p.noBooking}
            </p>
            {p.season && <p className="mt-3 text-sm text-muted">Programme season: {p.season}</p>}
            <ol className="mt-10 grid gap-4 lg:grid-cols-3">
              {p.entries.map((e) => (
                <li key={e.id} className="flex flex-col rounded-2xl border border-line bg-paper p-6 sm:p-7">
                  <p className="eyebrow text-gold">{e.days}</p>
                  <p className="mt-4 flex items-baseline justify-between gap-3">
                    <span className="display text-[32px] tabular-nums text-green">{e.time}</span>
                    <span className="text-sm text-muted">{e.duration}</span>
                  </p>
                  <h3 className="mt-4 text-[20px] font-medium text-green">{e.title}</h3>
                  <p className="mt-2 text-[15px] text-muted">{e.body}</p>
                  <p className="mt-auto pt-5 text-sm text-ink">
                    <span className="text-muted">Start:</span> {e.location}
                  </p>
                </li>
              ))}
            </ol>
          </>
        )}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {!p.comingSoon && (
            <div>
              <h3 className="eyebrow text-green">Before you join</h3>
              <Prose text={p.notes} className="mt-3 text-[15px] text-muted" />
            </div>
          )}
          <div className="border-l-2 border-gold pl-6">
            {p.selfGuided.eyebrow && <p className="eyebrow text-gold">{p.selfGuided.eyebrow}</p>}
            <h3 className="mt-2 text-[20px] font-medium text-green">{p.selfGuided.title}</h3>
            <Prose text={p.selfGuided.body} className="mt-2 text-[15px] text-muted" />
            <Actions actions={p.selfGuided.actions} variant="outline" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function AuroraSection({ s, n }: { s: Section; n: number }) {
  // Kortti jolla on iso aika (meta) = "Lights down. Look up."; muut kohdat tavallisina kortteina alle.
  const lights = s.items.find((it) => it.meta);
  const rest = s.items.filter((it) => it !== lights);
  return (
    <section id={s.id} className="wrap py-16 sm:py-24">
      <SectionHead n={n} eyebrow={s.eyebrow} title={s.title} intro={s.intro} />
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {lights && (
          <div className="relative overflow-hidden rounded-2xl bg-green-deep p-6 text-warm sm:p-8">
            {s.image && (
              <>
                <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-green-deep via-green-deep/85 to-green-deep/30" />
              </>
            )}
            <div className="relative">
              <p className="display text-[56px] tabular-nums">{lights.meta}</p>
              <h3 className="mt-1 text-[20px] font-medium">{lights.title}</h3>
              <Prose text={lights.body} className="mt-3 max-w-md text-[15px] text-warm/85" />
            </div>
          </div>
        )}
        {rest.map((it) => (
          <div key={it.id} className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
            <h3 className="text-[20px] font-medium text-green">{it.title}</h3>
            <Prose text={it.body} className="mt-3 text-[15px] text-muted" />
            <Actions actions={it.actions} variant="outline" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function HelpSection({ s, n, settings }: { s: Section; n: number; settings: Settings }) {
  return (
    <section id={s.id} className="wrap py-16 sm:py-24">
      <SectionHead n={n} eyebrow={s.eyebrow} title={s.title} intro={s.intro} />
      <div className="mt-10 flex flex-col gap-6 rounded-2xl border border-line bg-paper p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-[20px] font-medium text-green">Reception · {settings.receptionHours === "24 hours" ? "24/7" : settings.receptionHours}</p>
          <p className="mt-1 text-[15px] text-muted">For any help with your stay, message or call our reception team.</p>
          <p className="mt-2 flex flex-wrap gap-x-5 text-sm text-ink">
            <span>
              Calls{" "}
              <a href={telLink(settings.receptionCall)} className="inline-flex min-h-11 items-center whitespace-nowrap font-medium underline decoration-gold underline-offset-4">
                {settings.receptionCall}
              </a>
            </span>
            <span>
              WhatsApp{" "}
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center whitespace-nowrap font-medium underline decoration-gold underline-offset-4">
                {settings.whatsapp}
              </a>
            </span>
          </p>
        </div>
        <Actions
          actions={[
            { kind: "whatsapp", label: "WhatsApp reception" },
            { kind: "call", phone: settings.receptionCall, label: "Call reception" },
          ]}
          variant="outline"
          first="primary"
        />
      </div>
      <div className="mt-8">
        <Accordion items={s.items} />
      </div>
    </section>
  );
}
