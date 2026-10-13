"use client";

import type { Activities, Programme, Room } from "@/lib/content/types";
import { Area, Card, CheckNote, Field, RoomPicker, SaveBar, SmallButton, Text, Toggle, move, newId, setIn, useDoc } from "./ui";
import { ItemsEditor } from "./items-editor";

// ── Viikko-ohjelma ──────────────────────────────────────────────────────────

export function ProgrammeEditor({ initial }: { initial: Programme }) {
  const { doc, setDoc, dirty, markSaved } = useDoc(initial);
  const set = (path: (string | number)[], v: unknown) => setDoc((d) => setIn(d, path, v));

  return (
    <div className="space-y-6">
      <Card title="Yleiset">
        {doc.check && <CheckNote text={doc.check} onConfirm={() => set(["check"], undefined)} />}
        <div className="flex flex-wrap items-center gap-6">
          <Toggle label="Näkyvissä" checked={doc.visible} onChange={(v) => set(["visible"], v)} />
          <Toggle label="Coming soon" checked={Boolean(doc.comingSoon)} onChange={(v) => set(["comingSoon"], v)} />
          <RoomPicker value={doc.rooms} onChange={(v) => set(["rooms"], v)} />
        </div>
        {doc.comingSoon && (
          <Field label="Coming soon -teksti" hint="Näytetään ohjelmakorttien tilalla. Omatoimiset aktiviteetit näkyvät edelleen.">
            <Area value={doc.comingSoonText} onChange={(v) => set(["comingSoonText"], v)} rows={2} />
          </Field>
        )}
        <Field label="Kausi" hint="Esim. 1 Dec 2026 – 15 Apr 2027. Tyhjä = ei näytetä.">
          <Text value={doc.season} onChange={(v) => set(["season"], v)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Yläotsikko">
            <Text value={doc.eyebrow} onChange={(v) => set(["eyebrow"], v)} />
          </Field>
          <Field label="Otsikko">
            <Area value={doc.title} onChange={(v) => set(["title"], v)} rows={2} />
          </Field>
        </div>
        <Field label="Johdanto">
          <Area value={doc.intro} onChange={(v) => set(["intro"], v)} rows={2} />
        </Field>
        <Field label="“Free” -rivi">
          <Text value={doc.noBooking} onChange={(v) => set(["noBooking"], v)} />
        </Field>
      </Card>

      <Card title="Ohjelma">
        {doc.entries.map((e, i) => (
          <div key={e.id} className="rounded-lg border border-line bg-warm p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-medium text-green">{e.title || "(nimetön)"}</span>
              <div className="flex gap-1">
                <SmallButton onClick={() => setDoc((d) => ({ ...d, entries: move(d.entries, i, -1) }))} disabled={i === 0}>↑</SmallButton>
                <SmallButton onClick={() => setDoc((d) => ({ ...d, entries: move(d.entries, i, 1) }))} disabled={i === doc.entries.length - 1}>↓</SmallButton>
                <SmallButton onClick={() => setDoc((d) => ({ ...d, entries: d.entries.filter((_, j) => j !== i) }))} danger>
                  Poista
                </SmallButton>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Ohjelma">
                <Text value={e.title} onChange={(v) => set(["entries", i, "title"], v)} />
              </Field>
              <Field label="Päivät">
                <Text value={e.days} onChange={(v) => set(["entries", i, "days"], v)} placeholder="Monday & Thursday" />
              </Field>
              <Field label="Päivät lyhyesti">
                <Text value={e.daysShort} onChange={(v) => set(["entries", i, "daysShort"], v)} placeholder="Mon & Thu" />
              </Field>
              <Field label="Aika">
                <Text value={e.time} onChange={(v) => set(["entries", i, "time"], v)} placeholder="10:00–10:30" />
              </Field>
              <Field label="Kesto">
                <Text value={e.duration} onChange={(v) => set(["entries", i, "duration"], v)} placeholder="30 minutes" />
              </Field>
              <Field label="Lähtöpaikka">
                <Text value={e.location} onChange={(v) => set(["entries", i, "location"], v)} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Kuvaus">
                <Area value={e.body} onChange={(v) => set(["entries", i, "body"], v)} rows={2} />
              </Field>
            </div>
          </div>
        ))}
        <SmallButton
          onClick={() =>
            setDoc((d) => ({
              ...d,
              entries: [...d.entries, { id: newId("prog"), days: "", daysShort: "", time: "", duration: "", title: "Uusi ohjelma", body: "", location: "SkyView Safari House" }],
            }))
          }
        >
          + Lisää ohjelma
        </SmallButton>
      </Card>

      <Card title="Ennen osallistumista + omatoiminen">
        <Field label="Huomiot (Before you join)">
          <Area value={doc.notes} onChange={(v) => set(["notes"], v)} rows={6} />
        </Field>
        <ItemsEditor items={[doc.selfGuided]} onChange={(v) => v[0] && set(["selfGuided"], v[0])} showMeta={false} />
      </Card>

      <SaveBar docKey="programme" doc={doc} dirty={dirty} onSaved={markSaved} />
    </div>
  );
}

// ── Safari House -retket ────────────────────────────────────────────────────

export function ActivitiesEditor({ initial, bokunReady }: { initial: Activities; bokunReady: boolean }) {
  const { doc, setDoc, dirty, markSaved } = useDoc(initial);
  const set = (path: (string | number)[], v: unknown) => setDoc((d) => setIn(d, path, v));

  return (
    <div className="space-y-6">
      <Card title="Bokun">
        <p className="text-sm">
          {bokunReady ? (
            <span className="text-green">Bokun-avaimet asetettu. Retket, joilla on Bokun-ID, näyttävät hinnan, seuraavat lähdöt ja Book now -napin.</span>
          ) : (
            <span className="text-[#6b4e00]">
              Bokun-avaimia ei ole vielä asetettu (BOKUN_ACCESS_KEY, BOKUN_SECRET_KEY, BOKUN_CHANNEL_UUID). Kaikki retket näyttävät “Enquire & book”
              -napin, joka avaa WhatsApp-pyynnön.
            </span>
          )}
        </p>
      </Card>
      <Card title="Yleiset">
        <div className="flex flex-wrap items-center gap-6">
          <Toggle label="Näkyvissä" checked={doc.visible} onChange={(v) => set(["visible"], v)} />
          <RoomPicker value={doc.rooms} onChange={(v) => set(["rooms"], v)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Yläotsikko">
            <Text value={doc.eyebrow} onChange={(v) => set(["eyebrow"], v)} />
          </Field>
          <Field label="Otsikko">
            <Text value={doc.title} onChange={(v) => set(["title"], v)} />
          </Field>
        </div>
        <Field label="Johdanto">
          <Area value={doc.intro} onChange={(v) => set(["intro"], v)} rows={2} />
        </Field>
        <Field label="Huomautus listan alla">
          <Text value={doc.note} onChange={(v) => set(["note"], v)} />
        </Field>
      </Card>

      <Card title="Retket">
        {doc.items.map((a, i) => (
          <div key={a.id} className="rounded-lg border border-line bg-warm p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <span className="font-medium text-green">{a.title || "(nimetön)"}</span>
              <div className="flex gap-1">
                <SmallButton onClick={() => setDoc((d) => ({ ...d, items: move(d.items, i, -1) }))} disabled={i === 0}>↑</SmallButton>
                <SmallButton onClick={() => setDoc((d) => ({ ...d, items: move(d.items, i, 1) }))} disabled={i === doc.items.length - 1}>↓</SmallButton>
                <SmallButton onClick={() => setDoc((d) => ({ ...d, items: d.items.filter((_, j) => j !== i) }))} danger>
                  Poista
                </SmallButton>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-6">
              <Toggle label="Näkyvissä" checked={a.visible} onChange={(v) => set(["items", i, "visible"], v)} />
              <RoomPicker value={a.rooms} onChange={(v) => set(["items", i, "rooms"], v)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nimi" hint="Näkyy myös pyyntölomakkeen valikossa.">
                <Text value={a.title} onChange={(v) => set(["items", i, "title"], v)} />
              </Field>
              <Field label="Bokun-tuotteen ID" hint="Numero Bokunin tuotteen osoitteesta. Tyhjä = vain WhatsApp-pyyntö.">
                <Text value={a.bokunId} onChange={(v) => set(["items", i, "bokunId"], v.replace(/\D/g, ""))} mono />
              </Field>
              <Field label="Kesto (jos Bokun ei anna)">
                <Text value={a.duration} onChange={(v) => set(["items", i, "duration"], v)} placeholder="3 hours" />
              </Field>
              <Field label="Hinta (jos Bokun ei anna)">
                <Text value={a.priceFrom} onChange={(v) => set(["items", i, "priceFrom"], v)} placeholder="€169" />
              </Field>
              <Field label="Kuva (jos Bokun ei anna)" hint="/images/… tai https://…">
                <Text value={a.image} onChange={(v) => set(["items", i, "image"], v)} mono />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Kuvaus">
                <Area value={a.body} onChange={(v) => set(["items", i, "body"], v)} rows={2} />
              </Field>
            </div>
          </div>
        ))}
        <SmallButton
          onClick={() =>
            setDoc((d) => ({ ...d, items: [...d.items, { id: newId("act"), title: "Uusi retki", body: "", rooms: ["suite", "king", "aurora-cabin"], visible: true }] }))
          }
        >
          + Lisää retki
        </SmallButton>
      </Card>

      <SaveBar docKey="activities" doc={doc} dirty={dirty} onSaved={markSaved} />
    </div>
  );
}

// ── Huonetyypit ─────────────────────────────────────────────────────────────

export function RoomsEditor({ initial }: { initial: Room[] }) {
  const { doc, setDoc, dirty, markSaved } = useDoc(initial);
  const set = (i: number, k: keyof Room, v: unknown) => setDoc((d) => setIn(d, [i, k], v));

  return (
    <div className="space-y-6">
      {doc.map((r, i) => (
        <Card
          key={r.slug}
          title={r.name}
          actions={
            <a href={`/${r.slug}`} target="_blank" className="inline-flex min-h-10 items-center text-sm text-green underline">
              /{r.slug} ↗
            </a>
          }
        >
          {r.check && <CheckNote text={r.check} onConfirm={() => set(i, "check", undefined)} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nimi (lyhyt)">
              <Text value={r.name} onChange={(v) => set(i, "name", v)} />
            </Field>
            <Field label="Virallinen nimi">
              <Text value={r.official} onChange={(v) => set(i, "official", v)} />
            </Field>
            <Field label="Otsikko">
              <Text value={r.title} onChange={(v) => set(i, "title", v)} />
            </Field>
            <Field label="Sana teksteissä ({{room}})" hint="igloo / cabin">
              <Text value={r.noun} onChange={(v) => set(i, "noun", v)} />
            </Field>
            <Field label="Faktat">
              <Text value={r.facts} onChange={(v) => set(i, "facts", v)} />
            </Field>
            <Field label="Johdanto">
              <Text value={r.intro} onChange={(v) => set(i, "intro", v)} />
            </Field>
            <Field label="Pääkuva">
              <Text value={r.heroImage} onChange={(v) => set(i, "heroImage", v)} mono />
            </Field>
            <Field label="Valintasivun kuva">
              <Text value={r.cardImage} onChange={(v) => set(i, "cardImage", v)} mono />
            </Field>
            <Field label="Pohjapiirros (valinnainen)">
              <Text value={r.floorPlan} onChange={(v) => set(i, "floorPlan", v || undefined)} mono />
            </Field>
          </div>
        </Card>
      ))}
      <SaveBar docKey="rooms" doc={doc} dirty={dirty} onSaved={markSaved} />
    </div>
  );
}
