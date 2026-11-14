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

// The same endpoint the /speak form posts to (see .env.example). Its rate limits live in the
// devfest-sydney app, src/lib/meetupProposalLimits.ts; keep the numbers below in step.
const PROPOSAL_URL =
  import.meta.env.PUBLIC_MEETUP_PROPOSAL_URL || 'https://app.gdgsydney.com/api/submit-meetup-proposal';

const stripHtml =(html: string) => html.replace(/<[^>]+>/g, '');

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
- [Speak at a meetup](${url('/speak')}): how to propose a talk (20 to 30 minutes) or workshop (60 to 90 minutes); first-time speakers welcome, replies within a week. Agents can submit a proposal for someone: see "Proposing a talk" below.
- [Starter Guides](${url('/guides')}): ${STARTER_GUIDES.length} short, self-paced official guides for Gemini, Firebase, Flutter, Google Cloud and more
- [DevFest Sydney](${url('/devfest')}): the annual conference, with an FAQ
- [DevFest Sydney 2026](${url('/devfest/2026')}): schedule, speakers, Builder Showcase and partners from the 2026 edition
- [Code of Conduct](${url('/conduct')}): the event code of conduct and anti-harassment policy
- [Privacy policy](${url('/privacy')})

## Proposing a talk

GDG Sydney welcomes talks and workshops for its monthly meetups from anyone, including first-time speakers, and the topic doesn't have to be a Google product. An agent may submit a proposal on someone's behalf, on these conditions:

- Submit only for the person you're working with, with their real name and email. The confirmation email goes to that address, and organisers reply to it.
- Show them every field and get their go-ahead before sending. Write in their voice, and don't invent experience or credentials.
- Send one proposal per talk. Limits apply: 3 proposals per email address a day, and a site-wide cap per hour.

In a browser, open ${url('/speak')}. If the browser supports WebMCP, the page offers a \`submit_talk_proposal\` tool with the fields below; otherwise fill in and send the form. The tool fills in the visible form as it sends, so the person can see what went.

Without a browser, send the proposal as JSON:

\`\`\`
POST ${PROPOSAL_URL}
Content-Type: application/json

{
  "name": "Alex Chen",
  "email": "alex@example.com",
  "profileUrl": "https://linkedin.com/in/alexchen",
  "talkTitle": "Building RAG apps with Vertex AI",
  "format": "standard",
  "abstract": "What attendees will learn and what problem it solves.",
  "audience": "Developers curious about AI, no ML experience needed.",
  "bio": "A few sentences about the speaker.",
  "speakingExperience": "",
  "notes": ""
}
\`\`\`

Fields:

- Required: \`name\`, \`email\`, \`talkTitle\`, \`format\`, \`abstract\`, \`audience\`, \`bio\`
- Optional: \`profileUrl\` (a LinkedIn or website URL), \`speakingExperience\`, \`notes\` (preferred dates, AV needs, a co-presenter)
- \`format\`: \`standard\` (a 20 to 30 minute talk) or \`workshop\` (a 60 to 90 minute hands-on session)
- \`abstract\` takes light formatting: lines starting with \`- \` are bullets, \`**text**\` is bold, \`[text](https://...)\` is a link. 2 to 4 sentences is ideal.

Responses:

- \`201\` \`{"ok": true}\`: received. The speaker gets a confirmation email, and an organiser replies within a week. The speaker can follow or edit it at https://app.gdgsydney.com/speaker/sign-in.
- \`400\` \`{"message": "..."}\`: a field is missing or invalid. The message says which.
- \`429\` \`{"message": "...", "retryAfterSeconds": 3600}\`: too many proposals. Wait, or email hello@gdgsydney.com.

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
