// Ohuet viivaikonit (24×24, currentColor).
const P: Record<string, string> = {
  igloo: "M4 20v-8a8 8 0 0 1 16 0v8M3 20h18M10 20v-4h4v4M8.5 9.5l2 2M12 4v4",
  cabin: "M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5",
  bell: "M4 18h16M6 18a6 6 0 0 1 12 0M12 9V7M10 7h4M3 21h18",
  dining: "M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3M17 21V3c-2.2 1.2-3.5 4-3.5 8H17",
  spa: "M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z",
  safari: "M3 20l6.5-11 4 6.5L16 12l5 8z",
  fire: "M12 21a6 6 0 0 0 6-6c0-4-3-6-4-9-1 2-2 3-2 5-1.4-1-2-2.5-2-4-2.3 2-4 5-4 8a6 6 0 0 0 6 6z",
  reindeer: "M8 3v4l-3 2M8 7l2.5-2M16 3v4l3 2M16 7l-2.5-2M9 10h6l-.5 5L12 19l-2.5-4z",
  parking: "M5 3h14v18H5zM10 17V8h3.2a2.6 2.6 0 0 1 0 5.2H10",
  assembly: "M12 3l9.5 16.5h-19zM12 10v4.5M12 17v.5",
  dome: "M3 19a9 9 0 0 1 18 0zM12 10v9M7.5 11.8L9.5 19M16.5 11.8L14.5 19",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  aurora: "M3 17c3-6 5-10 9-10s6 4 9 10M7 17c1.5-3 3-5.5 5-5.5s3.5 2.5 5 5.5M12 2v2",
  home: "M4 11l8-7 8 7M6 9.5V20h12V9.5",
  compass: "M12 3l4 9h-8zM12 21l-4-9h8z",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8v.5",
  close: "M6 6l12 12M18 6L6 18",
  chevron: "M9 6l6 6-6 6",
  back: "M15 6l-6 6 6 6",
  play: "M8 5v14l11-7z",
  pause: "M8 5v14M16 5v14",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  list: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
};

export function icon(name: string, size = 20): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[name] ?? ""}"/></svg>`;
}
