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

const PARTNER_MAILTO = 'mailto:hello@gdgsydney.com?subject=Partnering%20with%20GDG%20Sydney';

type State = { status: 'loading' } | { status: 'failed' } | { status: 'loaded'; partners: BevySponsor[] };

export default function Partners() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [insets, setInsets] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    fetch('https://gdg.community.dev/api/chapter_slim/gdg-sydney/sponsors/')
      .then(res => {
        if (!res.ok) throw new Error(`Bevy returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!cancelled) setState({ status: 'loaded', partners: Array.isArray(data) ? data : [] });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'failed' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const partners = state.status === 'loaded' ? state.partners : [];

  // The section always renders: even with no logos (or Bevy down), it's where a company
  // finds out how to become a partner.
  return (
    <section className="section section-partners" id="partners" aria-labelledby="partners-heading">
      <div className="container">
        <div className="partners-head">
          <h2 className="section-title" id="partners-heading">Partners</h2>
          <p className="partners-pitch">
            Our partners help keep every meetup free.{' '}
            <a href={PARTNER_MAILTO}>Partner with us</a>
          </p>
        </div>
        {state.status === 'loading' && (
          <div className="partners-grid" aria-hidden="true">
            <span className="skeleton skeleton-partner" />
            <span className="skeleton skeleton-partner" />
          </div>
        )}
        {partners.length > 0 && (
        <div className="partners-grid">
          {partners.map(partner => (
            <a
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="partner-card"
              key={partner.url || partner.company}
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
        )}
      </div>
    </section>
  );
}
