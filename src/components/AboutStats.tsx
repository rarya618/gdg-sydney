import { useEffect, useState } from 'react';

// Shown until Bevy answers, and kept if it doesn't: both are true lower bounds (2,490 members
// and 98 events in November 2026), so a failed request never reads as "0 events run".
const MEMBER_BASELINE = '2,400';
const EVENT_BASELINE = '90+';

function json(res: Response) {
  if (!res.ok) throw new Error(`Bevy returned ${res.status}`);
  return res.json();
}

export default function AboutStats() {
  const [memberCount, setMemberCount] = useState(MEMBER_BASELINE);
  const [totalEventCount, setTotalEventCount] = useState(EVENT_BASELINE);

  useEffect(() => {
    let cancelled = false;

    fetch('https://gdg.community.dev/api/chapter_slim/gdg-sydney/')
      .then(json)
      .then(data => {
        if (!cancelled && data.members_count) {
          setMemberCount(data.members_count.toLocaleString('en-AU'));
        }
      })
      .catch(() => {});

    fetch('https://gdg.community.dev/api/event_slim/for_chapter/539/?page_size=1&status=Completed&include_cohosted_events=true&visible_on_parent_chapter_only=true&fields=title')
      .then(json)
      .then(data => {
        if (!cancelled && data.count) setTotalEventCount(data.count.toLocaleString('en-AU'));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="section" id="about" aria-labelledby="about-heading">
        <div className="container">
          <div className="about-wrap">
            <div className="about-body">
              <h2 className="section-title" id="about-heading">About GDG Sydney</h2>
              <div className="about-text-group">
                <p>
                  GDG Sydney is the Sydney chapter of Google Developer Groups, a worldwide
                  network of developer communities run by local organisers. We&apos;ve been meeting
                  since 2013, and more than {memberCount} people have joined.
                </p>
                <p>
                  Each meetup has talks on AI and machine learning, Google Cloud, building
                  for web and mobile, or growing your career. We meet at Google Sydney,
                  Mantel Group and other venues around the city. It&apos;s free, there&apos;s
                  food, and you don&apos;t need to know anyone.
                </p>
              </div>
              <div className="about-links">
                <a
                  href="https://gdg.community.dev/gdg-sydney/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-link about-link-primary"
                >
                  See upcoming meetups on our community page
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14" aria-hidden="true">
                    <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a
                  href="https://developers.google.com/community/gdg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-link"
                >
                  About Google Developer Groups worldwide
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14" aria-hidden="true">
                    <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-stats" aria-label="Community stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-num">{memberCount}</span>
              <span className="stat-label">Members</span>
            </div>
            <div className="stat">
              <span className="stat-num">{totalEventCount}</span>
              <span className="stat-label">Events run</span>
            </div>
            <div className="stat">
              <span className="stat-num">{new Date().getFullYear() - 2013}</span>
              <span className="stat-label">Years active</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
