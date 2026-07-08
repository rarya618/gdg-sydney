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

export default function Team() {
  const [team, setTeam] = useState<BevyTeamMember[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('https://gdg.community.dev/api/chapter_slim/gdg-sydney/team/')
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setTeam(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setTeam([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (team.length === 0) return null;

  return (
    <section className="section section-team" id="team" aria-labelledby="team-heading">
      <div className="container">
        <h2 className="section-title" id="team-heading">Our team</h2>
        <div className="team-grid">
          {team.map(member => (
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
      </div>
    </section>
  );
}
