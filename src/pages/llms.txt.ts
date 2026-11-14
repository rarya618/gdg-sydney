import type { APIRoute } from 'astro';
import { EVENT, speakers, sessionForSpeaker, TRACKS } from '../lib/devfest2026';
import { DEVFEST_FAQ } from '../lib/devfestFaq';
import { STARTER_GUIDES, STARTER_GUIDE_GROUPS, starterGuideTimeLabel } from '../data/starterGuides';

// Built into dist/llms.txt (https://llmstxt.org): a plain-text map of the site for AI agents
// and LLM tools. Most pages are static HTML that agents can read directly. The homepage's
// events, stats, team and partners load from Bevy in the browser, so agents that don't run
// JavaScript can't see them; this file points them at the same public Bevy sources instead
// of copying the data here, where it would go stale between deploys. The DevFest and guide
// sections are generated from the same data the pages use, so they stay in step.

const COMMUNITY = 'https://gdg.community.dev/gdg-sydney/';
const BEVY_UPCOMING =
  'https://gdg.community.dev/api/event_slim/for_chapter/539/?page_size=10&status=Live&include_cohosted_events=true&visible_on_parent_chapter_only=true&order=start_date&fields=title,start_date,event_type_title,url,description_short,custom_tickets_url';
const BEVY_PAST =
  'https://gdg.community.dev/api/event_slim/for_chapter/539/?page_size=10&status=Completed&include_cohosted_events=true&visible_on_parent_chapter_only=true&order=-start_date&fields=title,start_date,event_type_title,url';

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '');

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://gdgsydney.com');
  const url = (path: string) => new URL(path, base).href;

  const speakerLines = speakers
    .map((speaker) => {
      const session = sessionForSpeaker(speaker.slug);
      const track = TRACKS[speaker.track]?.label;
      const title = session?.talkTitle ?? speaker.talkTitle;
      return `- [${speaker.name}](${url(`/devfest/2026/speakers/${speaker.slug}`)}): ${title}${track ? ` (${track})` : ''}`;
    })
    .join('\n');

  const guideSections = STARTER_GUIDE_GROUPS.map((group) => {
    const guides = STARTER_GUIDES.filter((guide) => guide.group === group.id);
    if (guides.length === 0) return '';
    const lines = guides
      .map((guide) => `- [${guide.title}](${guide.href}): ${guide.summary} (${starterGuideTimeLabel(guide)})`)
      .join('\n');
    return `### ${group.label}\n\n${lines}`;
  })
    .filter(Boolean)
    .join('\n\n');

  const faq = DEVFEST_FAQ.map(({ question, answer }) => `- **${question}** ${stripHtml(answer)}`).join('\n');

  const body = `# GDG Sydney

> Google Developer Group Sydney is a volunteer-run community of more than 2,400 developers and builders in Sydney, Australia, running since 2013. It hosts free monthly meetups with talks on AI, Google Cloud and app development, and runs DevFest Sydney, its annual conference presented by Google.

Key facts:

- Meetups are free, include food and drinks, and welcome every experience level.
- Events are announced and RSVPed on the community platform: ${COMMUNITY}
- Contact: hello@gdgsydney.com
- Times are in Sydney time (Australia/Sydney).

## Events

The homepage lists events by loading them from Bevy, the community platform, in the browser. To read them without running JavaScript, use these public JSON endpoints (no key needed). Each result has a \`url\` for the event page; when \`custom_tickets_url\` is set, RSVP there instead.

- [Upcoming events (JSON)](${BEVY_UPCOMING}): meetups that are scheduled, soonest first
- [Past events (JSON)](${BEVY_PAST}): completed meetups, most recent first
- [Community page](${COMMUNITY}): the human-readable list, and where people join to hear about new events

## Pages

- [Home](${url('/')}): what GDG Sydney is, upcoming and past meetups, the team and partners
- [Speak at a meetup](${url('/speak')}): how to propose a talk (20 to 30 minutes) or workshop (60 to 90 minutes); first-time speakers welcome, replies within a week. Proposals go through the form on that page, which a person should submit.
- [Starter Guides](${url('/guides')}): ${STARTER_GUIDES.length} short, self-paced official guides for Gemini, Firebase, Flutter, Google Cloud and more
- [DevFest Sydney](${url('/devfest')}): the annual conference, with an FAQ
- [DevFest Sydney 2026](${url('/devfest/2026')}): schedule, speakers, Builder Showcase and partners from the 2026 edition
- [Code of Conduct](${url('/conduct')}): the event code of conduct and anti-harassment policy
- [Privacy policy](${url('/privacy')})

## DevFest Sydney

DevFest Sydney 2027 hasn't been announced yet. The last edition was ${EVENT.name} ("${EVENT.theme} ${EVENT.subtitle}"), on ${EVENT.dateLabel} at ${EVENT.venue}, ${EVENT.address}.

### FAQ

${faq}

### ${EVENT.name} speakers

${speakerLines}

## Starter Guides

Each link goes to the vendor's own guide. Times are approximate and don't include installing anything.

${guideSections}

## Optional

- [Sitemap](${url('/sitemap.xml')})
- [Meetup](https://www.meetup.com/gdgcloudsydney/)
- [LinkedIn](https://www.linkedin.com/company/gdg-sydney/)
- [Instagram](https://www.instagram.com/gdgsydney)
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
