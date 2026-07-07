// NovoEd Video Practice on Mobile — case study content.
// Migrated from the original Webflow page ("video practice-mobile",
// wingzeng.design/video-practice-mobile). The old page's three process
// sliders become grid-2 boards; its "Results" figures were empty on the
// old site, so the results are folded into the Impact section as text.
// See oracle.js for the block variants understood by ProjectPage.

import hero from '../assets/projects/novoed-mobile/hero.png'
import overview from '../assets/projects/novoed-mobile/overview.jpg'
import research1 from '../assets/projects/novoed-mobile/research-1.png'
import research2 from '../assets/projects/novoed-mobile/research-2.png'
import processInfrastructure from '../assets/projects/novoed-mobile/process-infrastructure.png'
import layouts1 from '../assets/projects/novoed-mobile/layouts-1.png'
import layouts2 from '../assets/projects/novoed-mobile/layouts-2.png'
import layouts3 from '../assets/projects/novoed-mobile/layouts-3.png'
import layouts4 from '../assets/projects/novoed-mobile/layouts-4.png'
import social1 from '../assets/projects/novoed-mobile/social-1.png'
import social2 from '../assets/projects/novoed-mobile/social-2.png'
import compUiControls from '../assets/projects/novoed-mobile/comp-ui-controls.png'
import compUxPatterns from '../assets/projects/novoed-mobile/comp-ux-patterns.png'
import impactCollaboration from '../assets/projects/novoed-mobile/impact-collaboration.png'

export const NOVOED_MOBILE = {
  slug: 'novoed-mobile',
  name: 'NovoEd Mobile App',
  tag: 'Video Practice',
  title: 'Practice, Learn and Improve On-the-go',
  subtitle:
    'Bringing Video Practice to the NovoEd mobile app — with a new set of mobile design patterns built to outlast the feature.',
  meta: [
    { label: 'Company', value: 'NovoEd' },
    { label: 'Role', value: 'Design Lead' },
    { label: 'Scope', value: 'Mobile app design' },
    { label: 'Platform', value: 'iOS & Android' },
  ],
  // 1:1 cover art → wide editorial crop; the band is nudged up so both the
  // browser window and the phone clipboard stay in frame.
  hero: {
    src: hero,
    alt: 'NovoEd Video Practice on mobile, cover illustration',
    aspect: '2 / 1',
    position: '50% 35%',
  },
  sections: [
    {
      id: 'overview',
      label: 'Overview',
      nav: 'Overview',
      blocks: [
        {
          variant: 'lead',
          heading: 'Video Practice, now in your pocket',
          paragraphs: [
            'After launching the stellar feature of Video Practice on the NovoEd web platform, we saw the need to empower mobile learners with the capability to practice, learn, and improve on the go. Solving the unique challenges of incorporating Video Practice into the NovoEd mobile app became my next project.',
            'As the lead designer, I designed the mobile-facing experience of Video Practice for learners. Learners can practice on either the web platform or the app with the same user experience — and take advantage of the agility of mobile to record, review feedback, and learn from others more efficiently. I also established a new set of mobile design patterns that fit learners’ existing learning flow, accommodate their current needs in practice activities, and are extendable enough for future iteration across the app.',
          ],
        },
        {
          media: [{ src: overview, alt: 'Final Video Practice screens across the NovoEd mobile app' }],
        },
      ],
    },
    {
      id: 'challenges',
      label: 'The Challenges',
      nav: 'Challenges',
      blocks: [
        {
          heading: 'Different platform goals on the mobile app',
          paragraphs: [
            'Desktop users include admin roles like course admins and facilitators as well as corporate learners, while the companion app serves only learners who need to review and learn on the go. That difference in user types — and therefore product goals — meant the design goals also differed from those of Video Practice on the website. The main design questions became:',
          ],
          list: [
            'How might we make sure mobile app learners achieve the same practice performance as those on the web?',
            'How might we help learners increase practice efficiency by taking advantage of the mobile setting?',
          ],
        },
        {
          heading: 'The reality of incorporating practice into an existing app',
          paragraphs: [
            'The NovoEd mobile app was designed four years earlier, with fewer features and a simpler structure. On the surface level, the visual style was outdated and the existing mobile design library could not accommodate new features like Video Practice. On the perceptual level, this new, interactive, and organic feature was too inconsistent to live inside the current linear learning flow on mobile.',
            'The design therefore had to connect the past (existing interfaces and flows), the present (the feature of Video Practice), and the future (further updates and integrations):',
          ],
          list: [
            'How might we establish a set of new design patterns that fit learners’ existing learning flow, are effective enough to accommodate their current needs in practicing, and are extendable enough for future updates in other parts of the app?',
          ],
        },
      ],
    },
    {
      id: 'process',
      label: 'Design Process',
      nav: 'Process',
      blocks: [
        {
          variant: 'grid-2',
          heading: 'Understand the context and the user needs',
          list: [
            'Revisited the existing app’s structure and aligned the team on the UX strategy and scope, with plenty of 1:1s to understand the context.',
            'Understood the needs of the mobile app learner by conducting whiteboard sessions to code information under a guiding taxonomy at the concept, product, and interaction levels.',
            'Unified the steps and information across platforms, making sure the practice experience matched between the website and the mobile app.',
          ],
          media: [
            { src: research1, alt: 'Audit of the existing NovoEd app structure' },
            { src: research2, alt: 'Whiteboard synthesis of mobile learner needs' },
          ],
        },
        {
          heading: '1. The infrastructure: simplify the clicks, unify the experience',
          list: [
            'Reconstructed the page levels to fit the mobile app.',
            'Made sure the steps and information of the practice are unified across all platforms.',
          ],
          media: [{ src: processInfrastructure, alt: 'New page-level structure for practice on mobile' }],
        },
        {
          heading: '2. The landing page: prioritize learners’ top three goals',
          paragraphs: [
            'Each interface carried its own design question. For the landing page — the first page a learner reaches under a course — the layout had to accommodate learners’ top three goals.',
          ],
        },
        {
          variant: 'grid-2',
          heading: '3. The layouts: maximize the immersive experience on mobile',
          paragraphs: ['Design exercises for this question:'],
          list: [
            'Key interfaces identification.',
            'Layout exploration on each key interface.',
            'Each key interface was explored, discussed, and reviewed separately with its own design question.',
            'Each section went through 10+ versions of exploration and iteration.',
          ],
          media: [
            { src: layouts1, alt: 'Layout exploration: practice gallery, version A' },
            { src: layouts2, alt: 'Layout exploration: practice gallery, version B' },
            { src: layouts3, alt: 'Layout exploration: list versus gallery browsing' },
            { src: layouts4, alt: 'Layout exploration: My Practices and what’s new' },
          ],
        },
        {
          variant: 'grid-2',
          heading: '4. Social interactions: promote constructive feedback through comments',
          paragraphs: [
            'Beyond the common mobile design questions in social interaction (viewing and adding comments and replies), Video Practice raised unique ones. Incorporating video comments on mobile meant staying consistent with the desktop recording steps and the app recording experience, with visual design for each comment type, state, and CTA customized for mobile. Giving and viewing comments with timestamps required multiple, accurate trigger points for the timestamps and replying.',
          ],
          media: [
            { src: social1, alt: 'Video comments on mobile: types, states and CTAs' },
            { src: social2, alt: 'Giving and viewing timestamped comments on mobile' },
          ],
        },
        {
          heading: 'Adaptable mobile components',
          paragraphs: [
            'To enable the new feature while incorporating it seamlessly into the current learning flow, I had to think holistically at the component level. I created a new set of modular components — UI controls and UX patterns — specifically for Video Practice. At the same time, these components are adaptable enough to evolve and support the redesign of other pages in the app.',
          ],
          media: [
            {
              src: compUiControls,
              alt: 'Modular UI controls for Video Practice on mobile',
              caption: 'UI controls: cards, lists and CTAs.',
            },
            {
              src: compUxPatterns,
              alt: 'Modular UX patterns for Video Practice on mobile',
              caption: 'UX patterns: gallery browsing layouts, social interaction, video playing.',
            },
          ],
        },
      ],
    },
    {
      id: 'impact',
      label: 'Impact',
      nav: 'Impact',
      blocks: [
        {
          heading: 'Dramatically increased practices from the mobile app',
          paragraphs: [
            'Compared to desktop, using Video Practice on the NovoEd mobile app gives users more flexibility — start practice anytime, see what’s new from My Practice, and learn from others’ practice — and enriches their usage scenarios. The feature proved enormously successful in increasing practice engagement, the product’s key success metric, and the ability to practice through the app became a great initiative to promote sales of the NovoEd platform.',
          ],
        },
        {
          heading: 'Immediate adoption of the design components across the app',
          paragraphs: [
            'At the start of the project, I knew I would build the new design components specifically for the Video Practice feature. After seeing the positive results in usability testing and the great flexibility of the components, the design team rapidly adopted and evolved them in other redesign projects across the app.',
          ],
        },
        {
          heading: 'A highly inclusive, agile cross-functional collaboration',
          paragraphs: [
            'In the new reality of working from home, I brought designers, engineers, and stakeholders who rarely worked together onto the same file — using online whiteboarding and design tools to brainstorm, collect, and communicate ideas and questions, enlisting their help to define product requirements and understand technical limitations. I also practiced a more agile way of design hand-off: decomposing the whole feature into bite-sized pieces delivered rapidly, with kick-off videos alongside UX specs and redlines so details were well communicated with engineers. As a result, I was credited with fostering a new level of design–engineering collaboration at NovoEd.',
          ],
          media: [{ src: impactCollaboration, alt: 'Cross-functional collaboration board for the mobile project' }],
        },
      ],
    },
  ],
}
