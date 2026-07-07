// Tencent University 2.0 — case study content.
// Migrated from the original Webflow page ("tencent", wingzeng.design/tencent).
// The old page's sidebar-anchored long scroll is grouped into scrollable
// sections; the four survey insights become a feature-grid. The old
// "Result" figure asset no longer exists on the Webflow site, so the
// result stands as text (it carries the metrics). See oracle.js for the
// block variants understood by ProjectPage.

import hero from '../assets/projects/tencent/hero.png'
import overview from '../assets/projects/tencent/overview.jpeg'
import challenge from '../assets/projects/tencent/challenge.jpeg'
import quant1 from '../assets/projects/tencent/quant-1.jpeg'
import quant2 from '../assets/projects/tencent/quant-2.jpeg'
import hypotheses from '../assets/projects/tencent/hypotheses.jpeg'
import insight1 from '../assets/projects/tencent/insight-1.jpeg'
import insight2 from '../assets/projects/tencent/insight-2.jpeg'
import insight3 from '../assets/projects/tencent/insight-3.jpeg'
import insight4 from '../assets/projects/tencent/insight-4.jpeg'
import problemProfile from '../assets/projects/tencent/problem-profile.jpeg'
import decision from '../assets/projects/tencent/decision.jpeg'
import ideation from '../assets/projects/tencent/ideation.jpeg'
import wireframes from '../assets/projects/tencent/wireframes.png'
import iterations from '../assets/projects/tencent/iterations.jpeg'
import designDecision from '../assets/projects/tencent/design-decision.jpeg'

export const TENCENT = {
  slug: 'tencent',
  name: 'Tencent',
  tag: 'Mobile Learning',
  title: 'Transform Online Learning from Desktop to Mobile',
  subtitle:
    'Tencent University 2.0 — mobile learning and live-streaming that grew from thousands to 620,000+ users in three months.',
  meta: [
    { label: 'Company', value: 'Tencent' },
    { label: 'Role', value: 'PM → Product Designer' },
    { label: 'Scope', value: 'End-to-end mobile design' },
    { label: 'Impact', value: '620,000+ users' },
  ],
  hero: {
    src: hero,
    alt: 'Tencent University 2.0 on mobile and desktop',
  },
  sections: [
    {
      id: 'overview',
      label: 'Overview',
      nav: 'Overview',
      blocks: [
        {
          variant: 'lead',
          heading: 'From thousands to 620,000+ users in three months',
          paragraphs: [
            'Tencent University (TU) is an online learning platform offering technical talks and courses to IT practitioners in and outside of Tencent. I started at TU as a product manager, and later stepped further into product design — leveraging design to delight users while scaling the business.',
            'I led the product team to design and launch the mobile version of Tencent University 2.0, giving tech people access to talks and courses on their phones, and developed the new mobile live-streaming feature that lets millions of users interact with one another and with speakers in real time.',
            'Within three months the product grew from thousands to 620,000+ users with 1,500,000+ daily views through live-streaming. How? Here is the story.',
          ],
        },
        {
          media: [{ src: overview, alt: 'Tencent University 2.0, the redesigned mobile experience' }],
        },
      ],
    },
    {
      id: 'research',
      label: 'Research',
      nav: 'Research',
      blocks: [
        {
          heading: 'The challenge: boost the popularity of courses that were already good',
          paragraphs: [
            'When I took over the product it had been released for over a year but still suffered from low popularity, despite strong content from the very start: page views were under 10,000, and click-through, registration, and course-completion rates were 4–10x lower than competitors’ averages.',
          ],
          media: [{ src: challenge, alt: 'The starting point: strong content, weak metrics' }],
        },
        {
          heading: 'Quantitative analysis: a huge mobile–desktop disparity',
          paragraphs: [
            'Analyzing the back-end data surfaced a clue: over 90% of new users came from mobile, while the metrics suggested mobile users were having an unpleasant experience — especially in engagement, conversion, and study. But why were they dropping off? Where exactly did they struggle?',
          ],
          media: [
            { src: quant1, alt: 'Back-end data: mobile versus desktop performance' },
            { src: quant2, alt: 'The funnel stages where mobile users drop off' },
          ],
        },
        {
          heading: 'Hypotheses: most remain unknown until I speak to real users',
          paragraphs: [
            'I made a long list of hypotheses for why mobile users drop off. Few could be verified by back-end data alone — the items in grey were disproven at the back end. That meant conducting user research to gain a deep understanding of mobile users’ goals, contexts, frustrations, and preferences.',
          ],
          media: [{ src: hypotheses, alt: 'The hypothesis map, with disproven items in grey' }],
        },
        {
          heading: 'Survey & follow-up interviews',
          paragraphs: [
            'I conducted a survey with 489 participants and follow-up interviews with 30 of them — and started to resonate with the users who struggled with our product. Four insights stood out:',
          ],
        },
        {
          variant: 'feature-grid',
          items: [
            {
              heading: 'Mobile users study at multiple places outside — seldom at home or the office.',
              media: [{ src: insight1, alt: 'Insight 1: where mobile users actually study' }],
            },
            {
              heading: 'They have difficulty finding courses: what is displayed seldom matches what they have in mind.',
              media: [{ src: insight2, alt: 'Insight 2: course discovery falls short' }],
            },
            {
              heading: 'They look for help and reviews to evaluate whether to register.',
              media: [{ src: insight3, alt: 'Insight 3: reviews drive registration decisions' }],
            },
            {
              heading: 'Real-life distractions and limited interactions prevent them from staying engaged.',
              media: [{ src: insight4, alt: 'Insight 4: distractions and limited interaction hurt engagement' }],
            },
          ],
        },
      ],
    },
    {
      id: 'definition',
      label: 'Problem Definition',
      nav: 'Definition',
      blocks: [
        {
          heading: 'For mobile users, what would the interface be like to find courses and learn online efficiently?',
          media: [
            {
              src: problemProfile,
              alt: 'The mobile learner profile synthesized from research and data',
              caption:
                'The research insights and back-end data draw the user profile of mobile learners, and help shape the product decision.',
            },
          ],
        },
        {
          heading: 'The product decision: easy way-finding, accessible discussion, mobile-oriented',
          paragraphs: [
            'Translated from the qualitative insights and quantitative back-end data, the concept was that an easy-way-finding, discussion-accessible, and mobile-oriented product would solve users’ problems and allow true mobile learning.',
          ],
          media: [{ src: decision, alt: 'The three product pillars translated from research' }],
        },
      ],
    },
    {
      id: 'design',
      label: 'Design Process',
      nav: 'Design',
      blocks: [
        {
          heading: 'Ideation: involve the engineers as early as the brainstorming',
          paragraphs: [
            'Once the research was complete, I ran several rounds of brainstorming involving an education expert and an engineer. Together we shaped the ideas for a new interface aimed at mobile users, helping them learn more effectively.',
          ],
          media: [{ src: ideation, alt: 'Brainstorming session with education and engineering partners' }],
        },
        {
          heading: 'User flows & wireframes: start testing early',
          paragraphs: [
            'Early on there was no high-fidelity prototype for comprehensive usability testing. So after exploring the task flows, I simply asked 3 users for their read. Once they could easily understand the flows, I built wireframes on top of those tasks and kept iterating the details through 4 usability tests.',
          ],
          media: [{ src: wireframes, alt: 'Task flowchart and wireframes for the mobile experience' }],
        },
        {
          heading: 'Iterations: two rounds of what didn’t work',
          list: [
            'Round 1 — What didn’t work: a waterfall layout of featured courses in the center (tested users spent more time searching for what they wanted). How I iterated: foreground the course categories and place them in the center.',
            'Round 2 — What didn’t work: users lost interest when they couldn’t connect the categories to what they had in mind. How I iterated: add more topics as categories, and tag courses with more detailed keywords.',
          ],
          media: [{ src: iterations, alt: 'Layout iterations across the two testing rounds' }],
        },
        {
          heading: 'Tencent University 2.0: an online learning platform that maximizes mobile learning',
          media: [{ src: designDecision, alt: 'The final design of Tencent University 2.0' }],
        },
      ],
    },
    {
      id: 'result',
      label: 'The Result',
      nav: 'Result',
      blocks: [
        {
          variant: 'lead',
          heading: 'Users like it!',
          paragraphs: [
            'A month after the new mobile version was released, usage of all features increased across the board, with dramatic gains in mobile engagement, conversion, and study completion. All key metrics in these three categories showed at least 5x growth — and within three months the platform reached 620,000+ users with 1,500,000+ daily views through live-streaming.',
          ],
        },
      ],
    },
  ],
}
