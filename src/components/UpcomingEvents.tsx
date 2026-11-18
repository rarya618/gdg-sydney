import { useEffect, useState } from 'react';
import { classifyEvent } from '../lib/classifyEvent';
import {
  formatEventDate,
  formatEventTime,
  loadUpcomingEvents,
  rsvpUrl,
  venueLabel,
  type BevyEvent,
} from '../lib/upcomingEvents';

const COMMUNITY_URL = 'https://gdg.community.dev/gdg-sydney/';

// Bevy usually has one or two upcoming events, so two placeholder cards while it loads.
const SKELETON_CARDS = ['first', 'second'];

type State = { status: 'loading' } | { status: 'failed' } | { status: 'loaded'; events: BevyEvent[] };

export default function UpcomingEvents() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    loadUpcomingEvents().then(result => {
      if (cancelled) return;
      setState(result.ok ? { status: 'loaded', events: result.events } : { status: 'failed' });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const events = state.status === 'loaded' ? state.events : [];

  // The section always renders, so the header's Events link (/#events) has somewhere to
  // land even when Bevy has nothing scheduled.
  return (
    <section className="section section-events" id="events" aria-labelledby="events-heading">
      <div className="container">
        <h2 className="section-title" id="events-heading">Upcoming events</h2>
        <div aria-live="polite">
          {state.status === 'loading' && (
            <>
              <p className="sr-only" role="status">Checking for upcoming meetups…</p>
              <div className="events-grid" aria-hidden="true">
                {SKELETON_CARDS.map(key => (
                  <div className="event-card event-card--skeleton" key={key}>
                    <div className="event-card-body">
                      <div className="event-card-top">
                        <span className="skeleton skeleton-event-tag" />
                        <span className="skeleton skeleton-event-date" />
                      </div>
                      <span className="skeleton skeleton-event-title" />
                      <span className="skeleton skeleton-event-venue" />
                      <span className="skeleton skeleton-event-line" />
                      <span className="skeleton skeleton-event-line" />
                      <span className="skeleton skeleton-event-line skeleton-event-line--short" />
                      <span className="skeleton skeleton-event-rsvp" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {state.status === 'failed' && (
            <div className="events-empty">
              <p className="events-empty-title">We couldn&apos;t load the event list.</p>
              <p className="events-empty-body">
                Our events come from our community page, which didn&apos;t answer just now. Every
                upcoming meetup is listed there, with RSVPs.
              </p>
              <div className="events-empty-actions">
                <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
                  See events on our community page
                </a>
              </div>
            </div>
          )}
          {state.status === 'loaded' && events.length === 0 && (
            <div className="events-empty">
              <p className="events-empty-title">No meetups are scheduled right now.</p>
              <p className="events-empty-body">
                New dates go up on our community page first. Join the community and you&apos;ll
                hear as soon as the next one is announced.
              </p>
              <div className="events-empty-actions">
                <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
                  Join the community
                </a>
                <a href="#past-events" className="events-empty-link">See past events</a>
              </div>
            </div>
          )}
        </div>
        {events.length > 0 && (
          <div className="events-grid">
            {events.map(event => {
              const { label, accent } = classifyEvent(event.title);
              const venue = venueLabel(event);
              return (
                <div className={`event-card event-card--${accent}`} key={event.url}>
                  <div className="event-card-body">
                    <div className="event-card-top">
                      <span className="event-tag">{label}</span>
                      <div className="event-meta">
                        <span className="event-date">{formatEventDate(event.start_date)}</span>
                        <span className="event-time">{formatEventTime(event.start_date)}</span>
                      </div>
                    </div>
                    <h3 className="event-title">{event.title}</h3>
                    {venue && (
                      <p className="event-venue">
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14" aria-hidden="true">
                          <path d="M8 14.5s4.5-4.1 4.5-7.75a4.5 4.5 0 0 0-9 0C3.5 10.4 8 14.5 8 14.5Z" strokeLinejoin="round" />
                          <circle cx="8" cy="6.75" r="1.6" />
                        </svg>
                        <span className="sr-only">Venue: </span>
                        {venue}
                      </p>
                    )}
                    {event.description_short && (
                      <p className="event-desc">{event.description_short}</p>
                    )}
                    <a href={rsvpUrl(event)} target="_blank" rel="noopener noreferrer" className="event-rsvp">
                      RSVP
                      <span className="sr-only"> to {event.title}</span>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13" aria-hidden="true">
                        <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
