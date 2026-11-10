// The starter guides on /guides: a search box and group filters beside the cards, and a
// "New to coding?" path above them. Ported from the devfest-sydney app on 2026-11-10. Styles
// are the sg-* classes in src/pages/guides.astro. Rendered on the server too, so every card
// is in the page's HTML before this hydrates.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  STARTER_GUIDES,
  STARTER_GUIDE_BEGINNER_PATH,
  STARTER_GUIDE_GROUPS,
  STARTER_GUIDE_CODING_LABELS,
  starterGuideSetupLabel,
  starterGuideAccountLabel,
  STARTER_GUIDE_BILLING_LABEL,
  starterGuideTimeLabel,
  type StarterGuide,
  type StarterGuideGroup,
} from '../data/starterGuides';

const GROUP_LABELS = Object.fromEntries(STARTER_GUIDE_GROUPS.map((groupInfo) => [groupInfo.id, groupInfo.label]));
const GROUP_ORDER = Object.fromEntries(STARTER_GUIDE_GROUPS.map((groupInfo, groupIndex) => [groupInfo.id, groupIndex]));
const GROUP_COLORS = Object.fromEntries(STARTER_GUIDE_GROUPS.map((groupInfo) => [groupInfo.id, groupInfo.color]));
type GroupFilter = StarterGuideGroup | 'all';

function ArrowIcon() {
  return (
    <svg className="sg-arrow" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Everything a search can match on: what the card shows, plus the name of its group.
function searchableText(guide: StarterGuide): string {
  return [
    guide.title,
    guide.summary,
    STARTER_GUIDE_CODING_LABELS[guide.coding],
    starterGuideSetupLabel(guide),
    starterGuideAccountLabel(guide) ?? '',
    guide.needsBilling ? STARTER_GUIDE_BILLING_LABEL : '',
    GROUP_LABELS[guide.group],
  ]
    .join(' ')
    .toLowerCase();
}

// Every word of the query has to appear somewhere, in any order, so "no code design" finds Stitch.
function matchesQuery(guide: StarterGuide, query: string): boolean {
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  const guideText = searchableText(guide);
  return queryWords.every((queryWord) => guideText.includes(queryWord));
}

function GuideCard({ guide }: { guide: StarterGuide }) {
  const timeLabel = starterGuideTimeLabel(guide);
  const accountLabel = starterGuideAccountLabel(guide);
  // Billing is the one tag drawn as a warning: it's what most often stops someone partway.
  const tags = [
    { label: STARTER_GUIDE_CODING_LABELS[guide.coding], isWarning: false },
    { label: starterGuideSetupLabel(guide), isWarning: false },
    ...(accountLabel ? [{ label: accountLabel, isWarning: false }] : []),
    ...(guide.needsBilling ? [{ label: STARTER_GUIDE_BILLING_LABEL, isWarning: true }] : []),
    { label: timeLabel, isWarning: false },
  ];

  return (
    <li>
      <a
        href={guide.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${guide.title}, ${tags
          .filter((tag) => tag.label !== timeLabel)
          .map((tag) => tag.label)
          .join(', ')}, takes about ${timeLabel.replace('~', '')} (opens in a new tab)`}
        className="sg-card"
        style={{ '--group-color': GROUP_COLORS[guide.group] } as CSSProperties}
      >
        {guide.logo && (
          <img
            src={guide.logo.url}
            alt={guide.logo.alt}
            width={guide.logo.width}
            height={guide.logo.height}
            loading="lazy"
            decoding="async"
            className="sg-card-logo"
          />
        )}
        <h3 className="sg-card-title">{guide.title}</h3>
        <p className="sg-card-summary">{guide.summary}</p>
        {/* Below the growing summary, so the tags line up across a row of cards. */}
        <ul className="sg-tags" aria-hidden="true">
          {tags.map((tag) => (
            <li key={tag.label} className={tag.isWarning ? 'sg-tag sg-tag--warning' : 'sg-tag'}>
              {tag.label}
            </li>
          ))}
        </ul>
        <span className="sg-card-cta" aria-hidden="true">
          Get started <ArrowIcon />
        </span>
      </a>
    </li>
  );
}

// The beginner path's steps joined to their guides, dropping any whose guide has been removed.
const BEGINNER_STEPS = STARTER_GUIDE_BEGINNER_PATH.flatMap((step) => {
  const guide = STARTER_GUIDES.find((candidate) => candidate.href === step.href);
  return guide ? [{ ...step, guide }] : [];
});
const BEGINNER_TOTAL_MINUTES = BEGINNER_STEPS.reduce((total, step) => total + step.guide.minutes, 0);
// Every account the path needs, in first-use order, so nobody stops at step 2 to sign up.
const BEGINNER_ACCOUNTS = [...new Set(BEGINNER_STEPS.flatMap((step) => step.guide.accounts ?? []))];

// A compact numbered list rather than more cards: the same guides appear as cards in their groups.
function BeginnerPath() {
  if (BEGINNER_STEPS.length === 0) return null;
  const roundedTotal = Math.round(BEGINNER_TOTAL_MINUTES / 5) * 5;
  const accountsSentence =
    BEGINNER_ACCOUNTS.length === 0
      ? ''
      : ` You'll need ${
          BEGINNER_ACCOUNTS.length === 1
            ? `a ${BEGINNER_ACCOUNTS[0]} account`
            : `${BEGINNER_ACCOUNTS.map((account) => `a ${account}`).join(' and ')} account`
        }.`;

  return (
    <section aria-labelledby="sg-beginner-heading" className="sg-beginner">
      <h2 id="sg-beginner-heading" className="sg-beginner-title">
        New to coding? Start with these {BEGINNER_STEPS.length}
      </h2>
      <p className="sg-beginner-text">
        {`In order, from no code to your first code. All in the browser with nothing to install, about ${roundedTotal} minutes in total.${accountsSentence}`}
      </p>
      <ol className="sg-steps">
        {BEGINNER_STEPS.map((step, stepIndex) => (
          <li key={step.href}>
            <a
              href={step.guide.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Step ${stepIndex + 1}: ${step.guide.title}. ${step.why} Takes about ${starterGuideTimeLabel(step.guide).replace('~', '')} (opens in a new tab)`}
              className="sg-step"
              style={{ '--group-color': GROUP_COLORS[step.guide.group] } as CSSProperties}
            >
              <span className="sg-step-number" aria-hidden="true">{stepIndex + 1}</span>
              <span className="sg-step-text" aria-hidden="true">
                <span className="sg-step-title">{step.guide.title}</span>
                <span className="sg-step-why">{step.why}</span>
              </span>
              <span className="sg-step-time" aria-hidden="true">{starterGuideTimeLabel(step.guide)}</span>
              <ArrowIcon />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function StarterGuidesBrowser() {
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupFilter>('all');
  const browserTopRef = useRef<HTMLDivElement>(null);
  const scrollToTopAfterRenderRef = useRef(false);

  // Picking a group can shrink the page a lot, which would leave someone scrolled down past the
  // list they just asked for. Bring the top of the guides back into view if it is above the fold.
  // Done after the render: a smooth scroll started in the click handler is cut short when the
  // page shrinks underneath it.
  function selectGroup(groupFilter: GroupFilter) {
    scrollToTopAfterRenderRef.current = true;
    setSelectedGroup(groupFilter);
  }

  useEffect(() => {
    if (!scrollToTopAfterRenderRef.current) return;
    scrollToTopAfterRenderRef.current = false;
    const browserTop = browserTopRef.current;
    if (browserTop && browserTop.getBoundingClientRect().top < 0) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      browserTop.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }, [selectedGroup]);

  // Search first, so the sidebar can count matches per group whichever group is selected.
  // In group order, then list order within a group, so related results sit together.
  const searchMatches = STARTER_GUIDES.filter((guide) => matchesQuery(guide, query)).sort(
    (firstGuide, secondGuide) => GROUP_ORDER[firstGuide.group] - GROUP_ORDER[secondGuide.group],
  );
  const matchingGuides =
    selectedGroup === 'all' ? searchMatches : searchMatches.filter((guide) => guide.group === selectedGroup);

  const sidebarEntries: { id: GroupFilter; label: string; color?: string; count: number }[] = [
    { id: 'all', label: 'All guides', count: searchMatches.length },
    ...STARTER_GUIDE_GROUPS.map((groupInfo) => ({
      id: groupInfo.id,
      label: groupInfo.label,
      color: groupInfo.color,
      count: searchMatches.filter((guide) => guide.group === groupInfo.id).length,
    })),
  ];

  const isSearching = query.trim() !== '';
  const selectedGroupLabel = selectedGroup === 'all' ? null : GROUP_LABELS[selectedGroup];
  const isSingleResult = matchingGuides.length === 1;
  const resultSummary = `${matchingGuides.length} ${isSingleResult ? 'guide' : 'guides'}${
    selectedGroupLabel ? ` in ${selectedGroupLabel}` : ''
  }${isSearching ? ` ${isSingleResult ? 'matches' : 'match'} your search` : ''}`;

  // Group headings only help when browsing everything. A search or a single group is one list.
  const showGroupHeadings = selectedGroup === 'all' && !isSearching;
  const groupedGuides = STARTER_GUIDE_GROUPS.map((groupInfo) => ({
    ...groupInfo,
    guides: matchingGuides.filter((guide) => guide.group === groupInfo.id),
  })).filter((groupInfo) => groupInfo.guides.length > 0);

  return (
    <div ref={browserTopRef} className="sg-browser">
      {/* Sticky below the header on wide screens; stacked above the cards on narrow ones. */}
      <aside className="sg-sidebar">
        <label htmlFor="sg-search" className="sr-only">
          Search starter guides
        </label>
        <div className="sg-search">
          <svg className="sg-search-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="m16 16 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="sg-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search guides"
            aria-label="Search starter guides by name, topic, or what they need"
            className="sg-search-input"
          />
        </div>

        <nav aria-label="Guide groups" className="sg-groups">
          <p className="sg-groups-label">Groups</p>
          {/* Wrapping chips on narrow screens, a vertical list beside the cards on wide ones. */}
          <ul className="sg-group-list">
            {sidebarEntries.map((entry) => {
              const isSelected = selectedGroup === entry.id;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => selectGroup(entry.id)}
                    aria-pressed={isSelected}
                    aria-label={`Show ${entry.id === 'all' ? 'all guides' : `${entry.label} guides`}, ${entry.count} ${entry.count === 1 ? 'guide' : 'guides'}`}
                    className={isSelected ? 'sg-group sg-group--selected' : 'sg-group'}
                  >
                    <span
                      className={entry.color ? 'sg-group-dot' : 'sg-group-dot sg-group-dot--all'}
                      style={entry.color ? { background: entry.color } : undefined}
                      aria-hidden="true"
                    />
                    <span className="sg-group-name">{entry.label}</span>
                    <span className="sg-group-count" aria-hidden="true">{entry.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Visible once something narrows the list; screen readers hear it change either way. */}
        <p className={isSearching || selectedGroupLabel ? 'sg-result-summary' : 'sr-only'} aria-live="polite">
          {resultSummary}
        </p>
      </aside>

      <div>
        {matchingGuides.length === 0 ? (
          <div className="sg-empty">
            <h2 className="sg-empty-title">
              No {selectedGroupLabel ? `${selectedGroupLabel} ` : ''}guides match &ldquo;{query.trim()}&rdquo;
            </h2>
            <p className="sg-empty-text">
              {selectedGroup !== 'all' && searchMatches.length > 0 ? (
                <button
                  type="button"
                  onClick={() => selectGroup('all')}
                  aria-label={`Show all ${searchMatches.length} matching guides from every group`}
                  className="sg-empty-button"
                >
                  {searchMatches.length} {searchMatches.length === 1 ? 'guide matches' : 'guides match'} in other groups
                </button>
              ) : (
                <>Try a product name like Gemini or Flutter, or a tag like &ldquo;no code&rdquo;.</>
              )}
            </p>
          </div>
        ) : showGroupHeadings ? (
          <div className="sg-sections">
            <BeginnerPath />
            {groupedGuides.map((groupInfo) => (
              <section key={groupInfo.id} aria-labelledby={`sg-group-${groupInfo.id}`}>
                <h2 id={`sg-group-${groupInfo.id}`} className="sg-group-heading">
                  {groupInfo.label}
                </h2>
                <ul className="sg-grid">
                  {groupInfo.guides.map((guide) => (
                    <GuideCard key={guide.href} guide={guide} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          // One list for a search or a single group. Each card keeps its group's border colour.
          <>
            <h2 className={selectedGroupLabel ? 'sg-group-heading' : 'sr-only'}>
              {selectedGroupLabel ?? 'Search results'}
            </h2>
            <ul className="sg-grid">
              {matchingGuides.map((guide) => (
                <GuideCard key={guide.href} guide={guide} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
