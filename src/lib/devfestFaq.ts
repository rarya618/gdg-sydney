// DevFest FAQ, adapted from the original devfest.gdgsydney.com/faq for the time between
// editions. Answers are trusted, hand-written HTML (rendered with set:html); the plain-text
// version feeds the FAQPage structured data. Update the "next event" answers once 2027 is set.

const COMMUNITY = 'https://gdg.community.dev/gdg-sydney/';

export const DEVFEST_FAQ: { question: string; answer: string }[] = [
  {
    question: 'When is the next DevFest Sydney?',
    answer: `DevFest Sydney 2027 hasn't been announced yet. <a href="${COMMUNITY}" target="_blank" rel="noopener noreferrer">Join GDG Sydney on our community platform</a> to hear as soon as the date and venue are set. The last one, <a href="/devfest/2026">DevFest Sydney 2026</a>, ran on Saturday 10 October at Torrens University, Surry Hills.`,
  },
  {
    question: 'Who can attend?',
    answer:
      'Everyone. DevFest Sydney welcomes engineers, designers, product managers and founders of all experience levels, from students to senior leaders.',
  },
  {
    question: 'How do I get a ticket?',
    answer:
      'Tickets go on sale once the event is announced, and one ticket covers the whole day. Members of our community platform hear first.',
  },
  {
    question: 'How do I submit a talk or workshop?',
    answer: `The Call for Speakers is closed and opens again a few months before the next event. We welcome talks, workshops and lightning talks across the Developer, Builder and Workshops tracks. In the meantime, you can <a href="/speak">speak at one of our monthly meetups</a>.`,
  },
  {
    question: 'What tracks are there?',
    answer:
      'In 2026 there was a main stage for headline talks plus three tracks: Developer for engineers, Builder for product managers, designers and founders, and Workshops for hands-on, build-along sessions.',
  },
  {
    question: 'What is GDG Sydney?',
    answer: `Google Developer Group Sydney is a community of more than 2,400 developers and builders. DevFest Sydney is our flagship annual event, run by our organisers and presented by Google.`,
  },
  {
    question: 'How can my company sponsor DevFest Sydney?',
    answer: `Email <a href="mailto:hello@gdgsydney.com?subject=Sponsoring%20DevFest%20Sydney%202027">hello@gdgsydney.com</a> and we'll send you the sponsorship prospectus.`,
  },
  {
    question: 'Can I volunteer?',
    answer: `Yes, we're always looking for volunteers to help run the day. Email <a href="mailto:hello@gdgsydney.com?subject=Volunteering%20at%20DevFest%20Sydney">hello@gdgsydney.com</a>.`,
  },
  {
    question: 'Is there a Code of Conduct?',
    answer: `Yes. DevFest Sydney follows the <a href="/conduct">GDG Sydney Code of Conduct</a> and is committed to a harassment-free experience for everyone, regardless of background or experience level.`,
  },
];

export function faqStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: DEVFEST_FAQ.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer.replace(/<[^>]+>/g, '') },
    })),
  };
}
