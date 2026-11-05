import type { ImageMetadata } from 'astro';
import data from '../data/devfest-2026.json';

// DevFest Sydney 2026 is over, so its lineup is a frozen snapshot exported once from the
// devfest-sydney app's public projections (confirmed speakers only, no emails). Future
// editions are meant to read that app's public API instead; see PM.md in devfest-sydney.

export type Track = 'keynote' | 'spotlight' | 'developer' | 'builder' | 'workshop' | 'showcase';
export type TalkFormat = 'talk' | 'lightning-talk' | 'workshop';
export type Room = 'auditorium' | 'developer' | 'builder' | 'workshops' | 'all';
export type SponsorTier = 'diamond' | 'platinum' | 'gold' | 'silver' | 'community';

export interface Speaker {
  slug: string;
  name: string;
  tagline: string;
  bio: string;
  talkTitle: string;
  abstract: string;
  track: Track;
  format: TalkFormat;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
  hasPhoto: boolean;
  sessionPartners: { name: string; slug: string }[];
}

export interface Slot {
  kind: 'session' | 'break' | 'plenary';
  title: string;
  talkTitle: string | null;
  speakers: string[];
  sessionSlug: string | null;
  track: Track | null;
  format: TalkFormat | null;
  startTime: string;
  endTime: string;
  room: Room;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: SponsorTier;
  website: string;
  description: string | null;
}

export const EVENT = {
  name: 'DevFest Sydney 2026',
  theme: 'Build, Secure, Scale.',
  subtitle: 'Developers and Builders in the Agentic Era',
  dateLabel: 'Saturday, 10 October 2026',
  venue: 'Torrens University, Surry Hills',
  address: 'Shop 1/37 Foveaux St, Surry Hills NSW 2010',
};

export const speakers = data.speakers as Speaker[];
export const schedule = data.schedule as Slot[];
export const sponsors = data.sponsors as Sponsor[];

export const speakersBySlug = new Map(speakers.map((speaker) => [speaker.slug, speaker]));

export const TRACKS: Record<Track, { label: string; color: string }> = {
  keynote: { label: 'Keynote', color: 'var(--fg)' },
  spotlight: { label: 'Spotlight', color: 'var(--red)' },
  developer: { label: 'Developer', color: 'var(--blue)' },
  builder: { label: 'Builder', color: 'var(--green)' },
  workshop: { label: 'Workshops', color: 'var(--yellow)' },
  showcase: { label: 'Showcase', color: 'var(--yellow)' },
};

export const FORMAT_LABELS: Record<TalkFormat, string> = {
  talk: 'Talk',
  'lightning-talk': 'Lightning talk',
  workshop: 'Workshop',
};

// Grid columns, left to right. 'all' spans them.
export const ROOMS: Exclude<Room, 'all'>[] = ['auditorium', 'developer', 'builder', 'workshops'];

export const ROOM_LABELS: Record<Room, { name: string; track: string }> = {
  auditorium: { name: 'Auditorium', track: 'Spotlight' },
  developer: { name: 'Room 3.10', track: 'Developer' },
  builder: { name: 'Room 3.08', track: 'Builder' },
  workshops: { name: 'Room 3.03', track: 'Workshops' },
  all: { name: 'All rooms', track: '' },
};

// The four rooms, each owning one Google colour. This mapping is the DevFest visual
// system: the room bar on the hub, the archive masthead and the schedule's column header.
export const ROOM_TRACKS: {
  room: Exclude<Room, 'all'>;
  track: Track;
  name: string;
  color: string;
  text: string;
}[] = [
  { room: 'auditorium', track: 'spotlight', name: 'Spotlight', color: 'var(--red)', text: 'Headline talks on the main stage, open to everyone.' },
  { room: 'developer', track: 'developer', name: 'Developer', color: 'var(--blue)', text: 'Building agentic apps with Gemini, Flutter and Firebase.' },
  { room: 'builder', track: 'builder', name: 'Builder', color: 'var(--green)', text: 'For founders, PMs and designers prototyping with AI.' },
  { room: 'workshops', track: 'workshop', name: 'Workshops', color: 'var(--yellow)', text: 'Hands-on building and live coding in small groups.' },
];


// Times are stored in UTC and pinned to Sydney here, so the build machine's zone is irrelevant.
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Australia/Sydney',
  });
}

export function spansAllRooms(slot: Slot): boolean {
  return slot.room === 'all' || slot.kind === 'plenary';
}

export interface ScheduleRow {
  startTime: string;
  // A break or plenary that spans every room; null for a row of sessions.
  full: Slot | null;
  // Sessions by room, stacked when several run back to back in one room (lightning talks).
  columns: Record<Exclude<Room, 'all'>, Slot[]>;
}

// Rows of the schedule grid. A session joins the current row when it starts before the
// row's opening sessions end, so the 3:00, 3:10 and 3:20 lightning talks stack under the
// 2:45 block instead of getting three near-empty rows.
export function scheduleRows(): ScheduleRow[] {
  const rows: ScheduleRow[] = [];
  const emptyColumns = () => ({ auditorium: [], developer: [], builder: [], workshops: [] }) as ScheduleRow['columns'];
  for (const slot of schedule) {
    if (spansAllRooms(slot)) {
      rows.push({ startTime: slot.startTime, full: slot, columns: emptyColumns() });
      continue;
    }
    const last = rows.at(-1);
    // Measured against the sessions that opened the row, not ones stacked into it since.
    const openers = last && !last.full ? Object.values(last.columns).flat().filter((s) => s.startTime === last.startTime) : [];
    const firstEnd = openers.length ? Math.min(...openers.map((s) => Date.parse(s.endTime))) : 0;
    if (last && !last.full && Date.parse(slot.startTime) < firstEnd) {
      last.columns[slot.room as Exclude<Room, 'all'>].push(slot);
    } else {
      const columns = emptyColumns();
      columns[slot.room as Exclude<Room, 'all'>].push(slot);
      rows.push({ startTime: slot.startTime, full: null, columns });
    }
  }
  return rows;
}

export function sessionForSpeaker(slug: string): Slot | undefined {
  return schedule.find((slot) => slot.speakers.includes(slug));
}

// Same order the old site used: tracks as listed, then by name.
const TRACK_ORDER: Track[] = ['keynote', 'spotlight', 'developer', 'builder', 'workshop', 'showcase'];
export function speakersByTrack(): { track: Track; speakers: Speaker[] }[] {
  return TRACK_ORDER.map((track) => ({ track, speakers: speakers.filter((speaker) => speaker.track === track) })).filter(
    (group) => group.speakers.length > 0
  );
}

const speakerPhotos = import.meta.glob<{ default: ImageMetadata }>('../assets/devfest/2026/speakers/*.webp', {
  eager: true,
});
const partnerLogos = import.meta.glob<{ default: ImageMetadata }>('../assets/devfest/2026/partners/*.png', {
  eager: true,
});

export function speakerPhoto(slug: string): ImageMetadata | undefined {
  return speakerPhotos[`../assets/devfest/2026/speakers/${slug}.webp`]?.default;
}

export function partnerLogo(id: string): ImageMetadata {
  const logo = partnerLogos[`../assets/devfest/2026/partners/${id}.png`]?.default;
  if (!logo) throw new Error(`Missing DevFest 2026 partner logo: ${id}`);
  return logo;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

export const STATS = {
  speakers: speakers.length,
  sessions: schedule.filter((slot) => slot.speakers.length > 0).length,
  tracks: 4,
};
