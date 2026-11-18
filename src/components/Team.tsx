import { useEffect, useState } from 'react';

interface BevyTeamMember {
  user: {
    full_name: string;
    title: string;
    company: string;
    bio: string;
    profile_url: string;
    avatar: { thumbnail_url: string };
  };
  title: string;
}

const COMMUNITY_URL = 'https://gdg.community.dev/gdg-sydney/';

// Six organisers at the moment, so six placeholder tiles while Bevy loads.
const SKELETON_TILES = ['a', 'b', 'c', 'd', 'e', 'f'];

type State = { status: 'loading' } | { status: 'failed' } | { status: 'loaded'; team: BevyTeamMember[] };

export default function Team() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch('https://gdg.community.dev/api/chapter_slim/gdg-sydney/team/')
      .then(res => {
        if (!res.ok) throw new Error(`Bevy returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!cancelled) setState({ status: 'loaded', team: Array.isArray(data) ? data : [] });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'failed' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // An empty team list is real (Bevy answered with nobody), so the section steps aside.
  if (state.status === 'loaded' && state.team.length === 0) return null;

  return (
    <section className="section section-team" id="team" aria-labelledby="team-heading">
      <div className="container">
        <h2 className="section-title" id="team-heading">The organisers</h2>
        {state.status === 'loading' && (
          <div className="team-grid" aria-hidden="true">
            {SKELETON_TILES.map(key => (
              <div className="team-card team-card--skeleton" key={key}>
                <span className="skeleton skeleton-avatar" />
                <span className="skeleton skeleton-team-name" />
                <span className="skeleton skeleton-team-role" />
              </div>
            ))}
          </div>
        )}
        {state.status === 'failed' && (
          <p className="section-fallback">
            We couldn&apos;t load the organisers just now.{' '}
            <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer">
              Meet them on our community page
            </a>
            .
          </p>
        )}
        {state.status === 'loaded' && (
        <div className="team-grid">
          {state.team.map(member => (
            <a
              href={`https://gdg.community.dev${member.user.profile_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="team-card"
              key={member.user.profile_url}
            >
              <img
                src={member.user.avatar.thumbnail_url}
                alt={member.user.full_name}
                width={88}
                height={88}
                className="team-avatar"
                loading="lazy"
              />
              <div className="team-info">
                <p className="team-name">{member.user.full_name}</p>
                {(member.user.title || member.user.company) && (
                  <p className="team-role">
                    {member.user.title}{member.user.title && member.user.company ? ', ' : ''}{member.user.company}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
