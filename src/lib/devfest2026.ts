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
  address: '37 Foveaux St, Surry Hills NSW 2010',
};

export const speakers = data.speakers as Speaker[];
export const schedule = data.schedule as Slot[];
export const sponsors = data.sponsors as Sponsor[];

export const speakersBySlug = new Map(speakers.map((speaker) => [speaker.slug, speaker]));

export const TRACKS: Record<Track, { label: string; color: string }> = {
  keynote: { label: 'Keynote', color: 'var(--dark)' },
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

// Rows of the schedule grid: one per distinct start time, with full-width slots on their own.
export function scheduleRows(): { startTime: string; slots: Slot[] }[] {
  const rows: { startTime: string; slots: Slot[] }[] = [];
  for (const slot of schedule) {
    const last = rows.at(-1);
    if (last && last.startTime === slot.startTime && !spansAllRooms(slot) && !last.slots.some(spansAllRooms)) {
      last.slots.push(slot);
    } else {
      rows.push({ startTime: slot.startTime, slots: [slot] });
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
