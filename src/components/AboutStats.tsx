import { useEffect, useState } from 'react';

export default function AboutStats() {
  const [memberCount, setMemberCount] = useState('2,400');
  const [totalEventCount, setTotalEventCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch('https://gdg.community.dev/api/chapter_slim/gdg-sydney/')
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.members_count) {
          setMemberCount(data.members_count.toLocaleString('en-AU'));
        }
      })
      .catch(() => {
        if (!cancelled) setMemberCount('2,400');
      });

    fetch('https://gdg.community.dev/api/event_slim/for_chapter/539/?page_size=1&status=Completed&include_cohosted_events=true&visible_on_parent_chapter_only=true&fields=title')
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setTotalEventCount(data.count ?? 0);
      })
      .catch(() => {
        if (!cancelled) setTotalEventCount(0);
      });

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
                  network of developer communities run by volunteers. We&apos;ve been meeting
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
