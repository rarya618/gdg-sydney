import { useEffect, useState } from 'react';

interface BevyPastEvent {
  title: string;
  start_date: string;
  event_type_title: string;
  url: string;
}

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Sydney' });
}

function classifyEvent(event: BevyPastEvent): { label: string; accent: string } {
  if (/meetup/i.test(event.title)) return { label: 'Meetup', accent: 'yellow' };
  if (/workshop/i.test(event.title)) return { label: 'Workshop', accent: 'green' };
  return { label: 'Talk', accent: 'blue' };
}

export default function PastEvents() {
  const [pastEvents, setPastEvents] = useState<BevyPastEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('https://gdg.community.dev/api/event_slim/for_chapter/539/?page_size=4&status=Completed&include_cohosted_events=true&visible_on_parent_chapter_only=true&order=-start_date&fields=title,start_date,event_type_title,url&page=1')
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setPastEvents(data.results ?? []);
      })
      .catch(() => {
        if (!cancelled) setPastEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="section section-past" id="past-events" aria-labelledby="past-heading">
      <div className="container">
        <h2 className="section-title" id="past-heading">Past events</h2>
        <div className="past-list">
          {pastEvents.map(event => {
            const { label, accent } = classifyEvent(event);
            return (
              <a href={event.url} target="_blank" rel="noopener noreferrer" className="past-item" key={event.url}>
                <span className={`past-tag past-tag--${accent}`}>{label}</span>
                <span className="past-title">{event.title}</span>
                <span className="past-date">{formatEventDate(event.start_date)}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
