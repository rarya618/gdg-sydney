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
  if (/devfest/i.test(event.title)) return { label: 'Conference', accent: 'red' };
  if (/meetup/i.test(event.title)) return { label: 'Meetup', accent: 'yellow' };
  if (/workshop/i.test(event.title)) return { label: 'Workshop', accent: 'green' };
  return { label: 'Talk', accent: 'blue' };
}

// The 5 most recent first; each "See more" loads the next 5 by following Bevy's
// links.next, until there are none left.
const PAGE_SIZE = 5;
const FIRST_PAGE =
  `https://gdg.community.dev/api/event_slim/for_chapter/539/?page_size=${PAGE_SIZE}&status=Completed&include_cohosted_events=true&visible_on_parent_chapter_only=true&order=-start_date&fields=title,start_date,event_type_title,url&page=1`;

// Varied title widths so the placeholder rows look like a real list, not a barcode.
const SKELETON_TITLE_WIDTHS = ['62%', '48%', '71%', '55%', '40%'];

function SkeletonRows() {
  return (
    <>
      {SKELETON_TITLE_WIDTHS.slice(0, PAGE_SIZE).map(width => (
        <div className="past-item past-item--skeleton" aria-hidden="true" key={width}>
          <span className="skeleton skeleton-tag" />
          <span className="skeleton skeleton-title" style={{ width }} />
          <span className="skeleton skeleton-date" />
        </div>
      ))}
    </>
  );
}

interface BevyPage {
  results?: BevyPastEvent[];
  links?: { next: string | null };
}

export default function PastEvents() {
  const [pastEvents, setPastEvents] = useState<BevyPastEvent[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(FIRST_PAGE)
      .then(res => res.json())
      .then((data: BevyPage) => {
        if (cancelled) return;
        setPastEvents(data.results ?? []);
        setNextPage(data.links?.next ?? null);
      })
      .catch(() => {
        if (!cancelled) setPastEvents([]);
      })
      .finally(() => {
        if (!cancelled) setInitialLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = () => {
    if (!nextPage || loadingMore) return;
    setLoadingMore(true);
    setLoadMoreFailed(false);
    fetch(nextPage)
      .then(res => {
        if (!res.ok) throw new Error(`Bevy returned ${res.status}`);
        return res.json();
      })
      .then((data: BevyPage) => {
        const more = data.results ?? [];
        // Skip anything already shown, in case Bevy's list shifted between requests.
        setPastEvents(prev => [...prev, ...more.filter(e => !prev.some(p => p.url === e.url))]);
        setNextPage(data.links?.next ?? null);
      })
      .catch(() => setLoadMoreFailed(true))
      .finally(() => setLoadingMore(false));
  };

  return (
    <section className="section section-past" id="past-events" aria-labelledby="past-heading">
      <div className="container">
        <h2 className="section-title" id="past-heading">Past events</h2>
        <div className="past-list" aria-busy={!initialLoaded || loadingMore}>
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
          {(!initialLoaded || loadingMore) && <SkeletonRows />}
        </div>
        {(!initialLoaded || loadingMore) && (
          <p className="sr-only" role="status">Loading past events…</p>
        )}
        {nextPage && !loadingMore && (
          <div className="past-more">
            <button
              type="button"
              className="btn btn-ghost btn-lg"
              onClick={loadMore}
            >
              See more
            </button>
            {loadMoreFailed && (
              <p className="past-more-error" role="alert">
                Couldn&apos;t load more events. Please try again.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
