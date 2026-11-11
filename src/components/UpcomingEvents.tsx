import { useEffect, useState } from 'react';
import { classifyEvent } from '../lib/classifyEvent';

const BEVY_API =
  'https://gdg.community.dev/api/event_slim/for_chapter/539/?page_size=10&status=Live&include_cohosted_events=true&visible_on_parent_chapter_only=true&order=start_date&fields=title,start_date,event_type_title,url,description_short&page=1';

interface BevyEvent {
  title: string;
  start_date: string;
  event_type_title: string;
  url: string;
  description_short: string;
}

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Sydney' });
}

function formatEventTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Australia/Sydney' });
}

// Bevy usually has one or two upcoming events, so two placeholder cards while it loads.
const SKELETON_CARDS = ['first', 'second'];

export default function UpcomingEvents() {
  const [events, setEvents] = useState<BevyEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(BEVY_API)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setEvents(data.results ?? []);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The section always renders, so the header's Events link (/#events) has somewhere to
  // land even when Bevy has nothing scheduled.
  return (
    <section className="section section-events" id="events" aria-labelledby="events-heading">
      <div className="container">
        <h2 className="section-title" id="events-heading">Upcoming events</h2>
        <div aria-live="polite">
          {!loaded && (
            <>
              <p className="sr-only" role="status">Checking for upcoming meetups…</p>
              <div className="events-grid" aria-hidden="true">
                {SKELETON_CARDS.map(key => (
                  <div className="event-card event-card--skeleton" key={key}>
                    <div className="event-card-accent" />
                    <div className="event-card-body">
                      <div className="event-card-top">
                        <span className="skeleton skeleton-event-tag" />
                        <span className="skeleton skeleton-event-date" />
                      </div>
                      <span className="skeleton skeleton-event-title" />
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
          {loaded && events.length === 0 && (
            <div className="events-empty">
              <p className="events-empty-title">No meetups are scheduled right now.</p>
              <p className="events-empty-body">
                New dates go up on our community page first. Join the community and you&apos;ll
                hear as soon as the next one is announced.
              </p>
              <div className="events-empty-actions">
                <a
                  href="https://gdg.community.dev/gdg-sydney/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg"
                >
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
            return (
              <div className={`event-card event-card--${accent}`} key={event.url}>
                <div className="event-card-accent" aria-hidden="true"></div>
                <div className="event-card-body">
                  <div className="event-card-top">
                    <span className="event-tag">{label}</span>
                    <div className="event-meta">
                      <span className="event-date">{formatEventDate(event.start_date)}</span>
                      <span className="event-time">{formatEventTime(event.start_date)}</span>
                    </div>
                  </div>
                  <h3 className="event-title">{event.title}</h3>
                  {event.description_short && (
                    <p className="event-desc">{event.description_short}</p>
                  )}
                  <a href={event.url} target="_blank" rel="noopener noreferrer" className="event-rsvp">
                    RSVP
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
