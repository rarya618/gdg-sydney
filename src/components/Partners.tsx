import { useEffect, useState, type CSSProperties } from 'react';

interface BevySponsor {
  company: string;
  description: string;
  url: string;
  logo: string;
  sponsor_type: string;
}

// Logos arrive in any shape. Fitting them all to the same box makes square logos look
// small next to wide ones, so each logo is scaled to cover roughly the same area:
// a square logo fills the box height, a 4:1 wordmark gets half of it.

/** Fraction of the logo box's height to trim from top and bottom (0 for square or tall logos). */
function logoInset(img: HTMLImageElement): number {
  const ratio = img.naturalWidth / img.naturalHeight;
  if (!ratio || ratio <= 1) return 0;
  const heightShare = Math.min(1, 1 / Math.sqrt(ratio));
  return (1 - heightShare) / 2;
}

export default function Partners() {
  const [partners, setPartners] = useState<BevySponsor[]>([]);
  const [insets, setInsets] = useState<Record<string, number>>({});

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
              <img
                src={partner.logo}
                alt={partner.company}
                width={200}
                height={80}
                className="partner-logo"
                loading="lazy"
                style={{ '--logo-inset': insets[partner.company] ?? 0 } as CSSProperties}
                onLoad={e => {
                  const inset = logoInset(e.currentTarget);
                  setInsets(prev => ({ ...prev, [partner.company]: inset }));
                }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
