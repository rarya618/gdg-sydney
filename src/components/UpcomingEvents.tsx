import { useEffect, useState } from 'react';

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

function classifyEvent(event: BevyEvent): { label: string; accent: string } {
  if (/meetup/i.test(event.title)) return { label: 'Meetup', accent: 'yellow' };
  if (event.event_type_title === 'Workshop / Study Group') return { label: 'Workshop', accent: 'green' };
  return { label: 'Talk', accent: 'blue' };
}

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

  if (loaded && events.length === 0) return null;

  return (
    <section className="section section-events" id="events" aria-labelledby="events-heading">
      <div className="container">
        <h2 className="section-title" id="events-heading">Upcoming events</h2>
        <div className="events-grid">
          {events.map(event => {
            const { label, accent } = classifyEvent(event);
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
      </div>
    </section>
  );
}
