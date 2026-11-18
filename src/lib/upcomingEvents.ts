// Upcoming events from Bevy, shared by the hero's "Next meetup" line and the Upcoming events
// section. Both islands import this module, so they share one request.

const BEVY_API =
  'https://gdg.community.dev/api/event_slim/for_chapter/539/?page_size=10&status=Live&include_cohosted_events=true&visible_on_parent_chapter_only=true&order=start_date&fields=title,start_date,url,description_short,custom_tickets_url,venue_name,venue_city&page=1';

export interface BevyEvent {
  title: string;
  start_date: string;
  url: string;
  description_short: string;
  custom_tickets_url: string | null;
  venue_name: string | null;
  venue_city: string | null;
}

export type UpcomingResult = { ok: true; events: BevyEvent[] } | { ok: false };

let request: Promise<UpcomingResult> | null = null;

/** Resolves with the events, or `ok: false` when Bevy can't be reached, so a failure is never shown as "nothing scheduled". */
export function loadUpcomingEvents(): Promise<UpcomingResult> {
  request ??= fetch(BEVY_API)
    .then(res => {
      if (!res.ok) throw new Error(`Bevy returned ${res.status}`);
      return res.json();
    })
    .then(data => ({ ok: true as const, events: (data.results ?? []) as BevyEvent[] }))
    .catch(() => {
      // Let a later mount try again rather than caching the failure.
      request = null;
      return { ok: false as const };
    });
  return request;
}

// Events ticketed elsewhere (e.g. Luma) carry the ticket link in custom_tickets_url; everything
// else RSVPs on Bevy. Bevy tags the ticket link utm_source=bevy, so retag it to tell site clicks apart.
export function rsvpUrl(event: BevyEvent) {
  if (!event.custom_tickets_url) return event.url;
  try {
    const url = new URL(event.custom_tickets_url);
    url.searchParams.set('utm_source', 'gdgsydney.com');
    return url.toString();
  } catch {
    return event.url;
  }
}

// Bevy's venue fields are typed in by hand: "PYRMONT", "Pyrmont, New South Wales", "Online
// event", or a sentence about a webinar. These turn them into a short, consistent line.
function tidyCity(city: string | null) {
  if (!city) return '';
  const trimmed = city.replace(/,\s*(New South Wales|NSW)\s*$/i, '').trim();
  return trimmed === trimmed.toUpperCase()
    ? trimmed.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    : trimmed;
}

/**
 * Where the event is, or null when Bevy has nothing usable. `short` keeps just the venue's
 * name ("Google Sydney, Pyrmont"), for the hero; otherwise the building is included too.
 */
export function venueLabel(event: BevyEvent, short = false): string | null {
  const name = event.venue_name?.trim() ?? '';
  if (/^online/i.test(name)) return 'Online';
  // A sentence rather than a place name; the event page explains it better.
  if (!name || name.length > 60) return null;
  const [place, building] = name.split(/\s+-\s+/);
  const venue = short || !building ? place : `${place}, ${building}`;
  const city = tidyCity(event.venue_city);
  return city && !venue.toLowerCase().includes(city.toLowerCase()) ? `${venue}, ${city}` : venue;
}

export function formatEventDate(iso: string, style: 'long' | 'short' = 'long') {
  return new Date(iso).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    ...(style === 'long' ? { year: 'numeric' } : {}),
    timeZone: 'Australia/Sydney',
  });
}

export function formatEventTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Australia/Sydney' });
}
