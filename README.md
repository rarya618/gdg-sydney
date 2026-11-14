# GDG Sydney

The website for [Google Developer Group Sydney](https://gdgsydney.com): our monthly meetups, the people who run them, how to give a talk, and DevFest Sydney, our annual conference.

**Live:** https://gdgsydney.com

Built with [Astro](https://astro.build), with a few React islands, and hosted on Firebase Hosting.

## Getting started

You need Node.js 22.12 or newer.

```sh
npm install
cp .env.example .env
npm run dev
```

The site runs at http://localhost:4321.

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server at localhost:4321 |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the built site locally |
| `npx astro dev --background` | Run the dev server in the background (`npx astro dev stop` to stop it) |

If a page looks unstyled after a large CSS change, restart the dev server. It occasionally serves stale styles.

### Environment variables

| Variable | Used for |
|---|---|
| `PUBLIC_MEETUP_PROPOSAL_URL` | Where the Speak form sends proposals: `/api/submit-meetup-proposal` on the back office (app.gdgsydney.com). Also printed in `llms.txt` for agents. See [Speak form](#speak-form). |
| `PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID for the `gdg-sydney` property. Leave empty to build without analytics. |

## Pages

| Route | Page |
|---|---|
| `/` | Homepage: hero, upcoming and past events, about, team, partners |
| `/speak` | Talk and workshop proposal form for meetups |
| `/guides` | Starter Guides: official, self-paced guides picked by GDG Sydney, with search and filters |
| `/conduct` | Event Code of Conduct and anti-harassment policy |
| `/privacy` | Privacy policy: talk proposals, Google Analytics, other services |
| `/devfest` | DevFest Sydney hub: what it is, 2026 recap, how to get involved, FAQ |
| `/devfest/2026` | DevFest Sydney 2026 archive: rooms, schedule, speakers, partners, venue |
| `/devfest/2026/speakers/<name>` | One page per 2026 speaker |

`/sitemap.xml` and `/robots.txt` are generated at build time by `src/pages/sitemap.xml.ts` and `src/pages/robots.txt.ts`. New pages appear in the sitemap automatically; a new dynamic route (like `[slug]`) needs its paths added in `sitemap.xml.ts`.

## For AI agents

The site is meant to be easy for AI agents and LLM tools to read and use:

- **`/llms.txt`** ([llmstxt.org](https://llmstxt.org)) is generated at build time by `src/pages/llms.txt.ts`. It summarises GDG Sydney, lists every page, and explains how to propose a talk. The DevFest, FAQ and Starter Guides sections are built from the same data as the pages, so they update themselves. When you add a page, add a line for it there too.
- **Live events aren't copied into `llms.txt`.** The homepage loads events, team and partners from Bevy in the browser, which agents that don't run JavaScript can't see. `llms.txt` points them at Bevy's public JSON instead, so it never goes stale between deploys.
- **Structured data** (JSON-LD): Organization on the homepage, FAQPage on `/devfest`, Event on `/devfest/2026`, and Person on each speaker page.
- **Proposing a talk:** see [Speak form](#speak-form).

## Project structure

```text
src/
├── layouts/SiteLayout.astro   Shared shell: head, header, mobile menu, footer, colour tokens
├── pages/                     One file per route (see above)
├── components/
│   ├── Footer.astro
│   ├── UpcomingEvents.tsx     React islands that load from Bevy in the browser
│   ├── PastEvents.tsx
│   ├── AboutStats.tsx
│   ├── Team.tsx
│   ├── Partners.tsx
│   ├── StarterGuidesBrowser.tsx  Search and filters for /guides
│   └── devfest/               RoomBar, SlotCard, SectionRail (DevFest 2026 archive)
├── data/
│   ├── devfest-2026.json      Frozen DevFest 2026 speakers, schedule and sponsors
│   └── starterGuides.ts       The Starter Guides list
├── lib/                       DevFest helpers, FAQ content, logo selection
├── assets/                    Images processed by Astro (speaker photos, logos, hero photos)
└── styles/global.css          Tailwind import and @font-face rules
public/                        Served as-is: fonts, logos, favicon, homepage photos
```

## Where content comes from

- **Events, team and partners** on the homepage load live from [Bevy](https://gdg.community.dev/gdg-sydney/), our community platform, in the visitor's browser. Edit them there, not here. When nothing is scheduled, the Upcoming events section shows an empty state.
- **DevFest Sydney 2026** is a frozen snapshot in `src/data/devfest-2026.json`, exported once from the DevFest app's public data (confirmed speakers only, no emails), with its images copied into `src/assets/devfest/`. The event is over, so it doesn't change.
- **DevFest FAQ** answers live in `src/lib/devfestFaq.ts`. Update the "next event" answers once DevFest 2027 is announced.
- **Starter Guides** are in `src/data/starterGuides.ts`. Each links to the vendor's own guide; add one by appending an entry.
- **Everything else** (copy, the Speak page, the Code of Conduct) is in the page files under `src/pages/`.

## Speak form

The form on `/speak` posts to `/api/submit-meetup-proposal` in the [devfest-sydney](https://github.com/rarya618/devfest-sydney) app, which:

1. validates the proposal,
2. saves it to the `meetupProposals` collection in Firestore (project `devfest-sydney-2026`), and
3. emails the proposer a confirmation, bcc'd to hello@gdgsydney.com so organisers hear about it.

Browsers can only post to it from gdgsydney.com and localhost:4321. The form also has a hidden honeypot field to catch bots. This site has no server and holds no Firebase credentials; the Firestore security rules live in the devfest-sydney repo.

### Proposals from AI agents

An agent can propose a talk for the person it's working with, in two ways:

- **In a browser,** the Speak page registers a `submit_talk_proposal` tool through [WebMCP](https://github.com/webmachinelearning/webmcp) (`navigator.modelContext`). The tool fills in the visible form and sends it through the same code as the button, so the person sees what went. In browsers without WebMCP it does nothing, and agents fill in the form like a person would.
- **Without a browser,** agents post JSON straight to the endpoint, following the "Proposing a talk" section of `/llms.txt`.

The endpoint limits proposals to 3 per email address a day and 20 site-wide an hour, and labels ones sent from outside a browser "Sent by an agent" in the admin. Those limits live in devfest-sydney (`src/lib/meetupProposalLimits.ts`). If they change, update the numbers in `src/pages/llms.txt.ts` to match.

## Design and brand

See [BRANDING.md](./BRANDING.md) for the full brand guide: typefaces, colours, the tagline (**Learn. Build. Connect.**) and implementation notes. The essentials:

- The site is **dark only**. Colours are CSS variables defined once in `src/layouts/SiteLayout.astro`. Change the palette there, not in individual pages.
- Fonts are self-hosted Google Sans and Google Sans Code (open-licensed, variable WOFF2 from Google Fonts), used in weights 400, 500 and 700 only.
- Header height (`--header-h`) and the shared hero height (`--hero-h`) are also set in the layout. The homepage hero is deliberately taller.
- Page heroes are marked with `data-hero`; the header stays transparent over them and fills in as you scroll.
- Copy is plain and friendly. Avoid em dashes and claims we can't back up.

## Deploying

The site deploys to the `gdgsydney` site on Firebase Hosting, in the `devfest-sydney-2026` project.

```sh
npm run build
firebase deploy --only hosting
```

You need the [Firebase CLI](https://firebase.google.com/docs/cli) and access to the project.

## Contributing

Questions, fixes or ideas: open an issue or email hello@gdgsydney.com. If you'd like to give a talk, use the form at [gdgsydney.com/speak](https://gdgsydney.com/speak).

## License

[GPL-3.0](./LICENSE)

GDG Sydney is an independently run community group and is not an official Google product or service.
