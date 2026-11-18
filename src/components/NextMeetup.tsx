import { useEffect, useState } from 'react';
import {
  formatEventDate,
  formatEventTime,
  loadUpcomingEvents,
  rsvpUrl,
  venueLabel,
  type BevyEvent,
} from '../lib/upcomingEvents';

// The hero's answer to "when's the next one, and where?", so it doesn't wait below the fold.
// It holds the same height in every state, so the hero never jumps when Bevy answers. With
// nothing scheduled, or Bevy down, it points at the community page instead.

type State = { status: 'loading' } | { status: 'none' } | { status: 'next'; event: BevyEvent };

export default function NextMeetup() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    loadUpcomingEvents().then(result => {
      if (cancelled) return;
      const event = result.ok ? result.events[0] : undefined;
      setState(event ? { status: 'next', event } : { status: 'none' });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="next-meetup next-meetup--loading" aria-hidden="true">
        <span className="skeleton skeleton-next-label" />
        <span className="skeleton skeleton-next-line" />
      </div>
    );
  }

  if (state.status === 'none') {
    return (
      <div className="next-meetup">
        <p className="next-meetup-label">Next meetup</p>
        <a href="#events" className="next-meetup-line next-meetup-line--quiet">
          Dates are announced on our community page first
        </a>
      </div>
    );
  }

  const { event } = state;
  const venue = venueLabel(event, true);
  return (
    <div className="next-meetup">
      <p className="next-meetup-label">Next up</p>
      <p className="next-meetup-line">
        <a href="#events" className="next-meetup-title">{event.title}</a>
        <span className="next-meetup-when">
          {formatEventDate(event.start_date, 'short')}, {formatEventTime(event.start_date)}
          {venue && <> · {venue}</>}
        </span>
      </p>
      <a href={rsvpUrl(event)} target="_blank" rel="noopener noreferrer" className="next-meetup-rsvp">
        RSVP<span className="sr-only"> to {event.title}</span>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13" aria-hidden="true">
          <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
}
