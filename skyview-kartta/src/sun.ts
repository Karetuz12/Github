// Auringon paikka SkyView'n kohdalla (Rovaniemi). Riittävän tarkka valaistukseen.
const LAT = 66.5;
const LON = 25.73;
const rad = Math.PI / 180;

export function sunPosition(date: Date): { elevation: number; azimuth: number } {
  const day = (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(date.getUTCFullYear(), 0, 0)) / 864e5;
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const g = ((2 * Math.PI) / 365) * (day - 1 + (hours - 12) / 24);
  const decl =
    0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const eqt =
    229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const solarMin = hours * 60 + eqt + 4 * LON;
  const ha = (solarMin / 4 - 180) * rad;
  const lat = LAT * rad;
  const cosZen = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
  const zen = Math.acos(Math.min(1, Math.max(-1, cosZen)));
  let az = Math.acos(Math.min(1, Math.max(-1, (Math.sin(lat) * Math.cos(zen) - Math.sin(decl)) / (Math.cos(lat) * Math.sin(zen)))));
  if (ha > 0) az = 2 * Math.PI - az; // atsimuutti pohjoisesta myötäpäivään
  return { elevation: 90 - zen / rad, azimuth: az / rad };
}

/** Suomen aika (Europe/Helsinki) annetulle päivälle ja kellonajalle → Date. */
export function helsinkiDate(base: Date, minutesOfDay: number): Date {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki", year: "numeric", month: "2-digit", day: "2-digit" }).format(base);
  const [y, m, d] = parts.split("-").map(Number);
  // Arvaa UTC ja korjaa aikavyöhykkeen erolla
  const guess = new Date(Date.UTC(y, m - 1, d, 0, minutesOfDay));
  const local = new Date(guess.toLocaleString("en-US", { timeZone: "Europe/Helsinki" }));
  const utc = new Date(guess.toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(guess.getTime() - (local.getTime() - utc.getTime()));
}

export function helsinkiMinutes(date: Date): number {
  const [h, m] = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Helsinki", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .format(date)
    .split(":")
    .map(Number);
  return h * 60 + m;
}
