import { useEffect, useState } from 'react';

interface BevySponsor {
  company: string;
  description: string;
  url: string;
  logo: string;
  sponsor_type: string;
}

export default function Partners() {
  const [partners, setPartners] = useState<BevySponsor[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('https://gdg.community.dev/api/chapter_slim/gdg-sydney/sponsors/')
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setPartners(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setPartners([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (partners.length === 0) return null;

  return (
    <section className="section section-partners" id="partners" aria-labelledby="partners-heading">
      <div className="container">
        <h2 className="section-title" id="partners-heading">Partners</h2>
        <div className="partners-grid">
          {partners.map(partner => (
            <a
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="partner-card"
              aria-label={partner.company}
              key={partner.company}
            >
              <img src={partner.logo} alt={partner.company} className="partner-logo" loading="lazy" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
