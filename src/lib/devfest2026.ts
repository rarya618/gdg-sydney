import { inferRemoteSize } from 'astro:assets';
import data from '../data/devfest-2026.json';

// DevFest Sydney 2026 is over, so its lineup is a frozen snapshot exported once from the
// devfest-sydney app's public projections (confirmed speakers only, no emails). Future
// editions are meant to read that app's public API instead; see PM.md in devfest-sydney.
// Photos and logos are not copied into this repo: the data holds their Firebase Storage
// URLs, and Astro downloads and optimises them at build time (image.domains in
// astro.config.mjs). A file removed from Storage fails the next build rather than shipping
// a broken image.

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
  photoUrl: string | null;
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
  logoUrl: string;
}

// The Builder Showcase projects demoed on stage (one confirmed entrant didn't show, so isn't listed). Taken from the entry form
// (project, presenters, one-line pitch, a link they gave), lightly edited; no emails.
export interface ShowcaseProject {
  project: string;
  presenters: string[];
  pitch: string;
  url: string | null;
}

// The organisers opted in to the public crew page on the devfest-sydney app when the
// snapshot was taken, with a photo where they had uploaded one.
export interface Organiser {
  slug: string;
  name: string;
  role: string;
  linkedinUrl: string;
  photoUrl: string | null;
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
export const showcase = data.showcase as ShowcaseProject[];
export const organisers = data.organisers as Organiser[];
export const venuePartner = data.venuePartner as { name: string; website: string; logoUrl: string };

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

export function speakerPhoto(slug: string): string | undefined {
  return speakersBySlug.get(slug)?.photoUrl ?? undefined;
}

export function organiserPhoto(slug: string): string | undefined {
  return organisers.find((organiser) => organiser.slug === slug)?.photoUrl ?? undefined;
}

// A partner's logo with its size, which the wall needs to tell stacked logos from wide ones.
// 'torrens' is the venue partner; every other id is a sponsor.
export async function partnerLogo(id: string): Promise<{ src: string; width: number; height: number }> {
  const src = id === 'torrens' ? venuePartner.logoUrl : sponsors.find((sponsor) => sponsor.id === id)?.logoUrl;
  if (!src) throw new Error(`Missing DevFest 2026 partner logo: ${id}`);
  const { width, height } = await inferRemoteSize(src);
  return { src, width, height };
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
