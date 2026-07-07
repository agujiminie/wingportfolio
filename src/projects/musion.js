// Musion — case study content.
// Migrated from the Webflow page ("Musion.ai", wingzeng.design/musion-ai).
// The old page's product tabs become full-width feature blocks; its lightbox
// gallery becomes a grid-2 board. The old page's hero slot held a leftover
// NovoEd image + logo, so the product showcase board is promoted to hero.
// (The trailing NovoEd "THE SOLUTION" section on the old page is leftover
// content from another project — excluded.) See oracle.js for the block
// variants understood by ProjectPage.

import board from '../assets/projects/musion/board.png'
import featInspire from '../assets/projects/musion/feat-inspire.png'
import featPlans from '../assets/projects/musion/feat-plans.png'
import featGoals from '../assets/projects/musion/feat-goals.png'
import gallery1 from '../assets/projects/musion/gallery-1.png'
import gallery2 from '../assets/projects/musion/gallery-2.png'
import gallery3 from '../assets/projects/musion/gallery-3.png'
import gallery4 from '../assets/projects/musion/gallery-4.png'

export const MUSION = {
  slug: 'musion',
  name: 'Musion',
  tag: 'AI Search',
  title: 'Inspire, Build & Act on Your Passion',
  subtitle:
    'A GenAI-powered mobile app that turns inspiration into action — through AI vertical search and a smart journal.',
  meta: [
    { label: 'Role', value: 'Founding Designer' },
    { label: 'Platforms', value: 'Mobile app & web' },
    { label: 'Team', value: '3 people' },
    { label: 'Timeline', value: '2024.6 – present' },
  ],
  hero: {
    src: board,
    alt: 'Musion product showcase: journal, passion discovery, and AI guidance screens',
  },
  sections: [
    {
      id: 'overview',
      label: 'Overview',
      nav: 'Overview',
      blocks: [
        {
          variant: 'lead',
          heading: 'Turn inspiration into action',
          paragraphs: [
            'Musion is a GenAI-powered mobile app that turns inspiration into action. Designed to help users discover new passions, stay motivated, and bring creative ideas to life, Musion leverages cutting-edge AI to make creativity effortless and engaging.',
            'I’m creating Musion as my first startup to explore the untapped potential of AI vertical search and innovative task management within a mobile experience. The goal is clear: create a dynamic, intuitive tool that eliminates mundane tasks and captures spontaneous inspiration, empowering users to instantly turn their ideas into reality.',
          ],
        },
      ],
    },
    {
      id: 'product',
      label: 'The Product',
      nav: 'Product',
      blocks: [
        {
          heading: 'Spark inspiration',
          media: [{ src: featInspire, alt: 'Musion: discovering a new passion through AI vertical search' }],
        },
        {
          heading: 'Turn ideas into plans',
          media: [{ src: featPlans, alt: 'Musion: turning a spark into a concrete plan' }],
        },
        {
          heading: 'Achieve your goals',
          media: [{ src: featGoals, alt: 'Musion: tracking progress toward goals in the smart journal' }],
        },
      ],
    },
    {
      id: 'work',
      label: 'My Work',
      nav: 'My Work',
      blocks: [
        {
          heading: 'Founding designer, three hats',
          list: [
            'AI design on mobile — explore how AI can drive discovery experiences on mobile, including intuitive prompts, dynamic conversation, and feedback loops.',
            'Interaction design — craft and test design patterns such as mobile multi-view, widget design, and task management to create seamless creation workflows.',
            'Entrepreneurship — drive the overall product vision, balancing design leadership with strategic decision-making to create an innovative, market-ready product.',
          ],
        },
      ],
    },
    {
      id: 'gallery',
      label: 'Design Highlights',
      nav: 'Highlights',
      blocks: [
        {
          variant: 'grid-2',
          media: [
            { src: gallery1, alt: 'Musion design highlight: home journal cards' },
            { src: gallery2, alt: 'Musion design highlight: prompt exploration' },
            { src: gallery3, alt: 'Musion design highlight: conversation flow' },
            { src: gallery4, alt: 'Musion design highlight: saving notes from a conversation' },
          ],
          note: 'To learn more about the process of this project, please feel free to reach out.',
        },
      ],
    },
  ],
}
