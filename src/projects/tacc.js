// TACC Design System — case study content.
// Migrated from the original Webflow page ("TACC", wingzeng.design/tacc).
// The old page's sidebar-anchored long scroll is grouped into scrollable
// sections; the MVP deliverables become numbered blocks and the Adobe XD
// prototype links become block-level CTAs. See oracle.js for the block
// variants understood by ProjectPage.

import hero from '../assets/projects/tacc/hero.png'
import introPortals from '../assets/projects/tacc/intro-portals.jpeg'
import aboutTacc from '../assets/projects/tacc/about-tacc.jpeg'
import users from '../assets/projects/tacc/users.jpeg'
import direction from '../assets/projects/tacc/direction.jpeg'
import mvpPrinciples from '../assets/projects/tacc/mvp-principles.jpeg'
import mvpStyleguide from '../assets/projects/tacc/mvp-styleguide.png'
import mvpElements from '../assets/projects/tacc/mvp-elements.png'
import mvpPatterns from '../assets/projects/tacc/mvp-patterns.png'
import mvpIcons from '../assets/projects/tacc/mvp-icons.png'
import application from '../assets/projects/tacc/application.jpeg'

const PROTOTYPE_URL = 'https://xd.adobe.com/view/db2660cc-1011-4f26-5d31-019ce87c1fe8-ad17/grid'

export const TACC = {
  slug: 'tacc',
  name: 'TACC',
  tag: 'Design System',
  title: 'Build a Scalable Design Ecosystem for Engineers',
  subtitle:
    'An in-house design system for the Texas Advanced Computing Center’s cloud computing user portals — so engineers can build without worrying about the design.',
  meta: [
    { label: 'Company', value: 'TACC' },
    { label: 'Role', value: 'Product Designer' },
    { label: 'Scope', value: 'Design system MVP' },
    { label: 'Reach', value: '20+ portals & sites' },
  ],
  hero: {
    src: hero,
    alt: 'TACC Design System, component library overview',
  },
  sections: [
    {
      id: 'overview',
      label: 'Overview',
      nav: 'Overview',
      blocks: [
        {
          variant: 'lead',
          heading: 'One design system for every cloud computing portal',
          paragraphs: [
            'With the variety of supercomputing systems at the Texas Advanced Computing Center (TACC), different engineering teams build customized user portals and websites for each system. This in-house project helps those engineers build scalable, extendable cloud computing portals without worrying about the design — and, in the long term, gives end users a clear workflow through a consistent visual personality across TACC’s interfaces.',
            'As the product designer on the team, my role was to solve design inconsistency by building a design system for current and future cloud computing user portals and websites.',
          ],
        },
        {
          media: [{ src: introPortals, alt: 'The core portal redesigned with the new design system' }],
          cta: { label: 'View prototype demo', href: PROTOTYPE_URL },
        },
      ],
    },
    {
      id: 'challenge',
      label: 'The Challenge',
      nav: 'Challenge',
      blocks: [
        {
          heading: 'What does TACC do?',
          paragraphs: [
            'TACC provides cloud computing resources mainly for academic researchers at universities and research institutes in advanced science and technology, such as NASA. Users access and manage those computing resources through user portals.',
          ],
          media: [{ src: aboutTacc, alt: 'How researchers access TACC’s computing systems through portals' }],
        },
        {
          heading: '20+ portals maintained by different teams — each with its own design',
          paragraphs: [
            'TACC has more than 20 computing systems, each connected to different user portals — and the number of systems keeps growing. The portals look completely different in design, because they are developed by departments working in isolation, each with their own assumptions and code libraries, duplicating the same work.',
          ],
        },
        {
          heading: 'Two levels of users, the same struggle',
          paragraphs: [
            'The design system serves two levels of users: the makers of TACC’s websites, such as frontend developers, and the end users. After in-depth interviews with both, I found they share similar challenges caused by inconsistent design patterns in the console interfaces:',
          ],
          list: [
            'Makers struggle to take care of the design when creating new portals.',
            'End users feel confused by the inconsistent design across TACC’s portals.',
          ],
          media: [{ src: users, alt: 'The two user levels of the design system: makers and end users' }],
        },
        {
          heading: 'UI inventory: inconsistent UI, no shared rules, inefficient hand-offs',
          paragraphs: [
            'To understand the existing design patterns, I audited and collected UI component screenshots across the portals and consoles, then sorted out the inconsistencies. Buttons alone came in more than 6 colors and 3 fonts; loading icons had 3 styles at random sizes. The root cause is the lack of shared design rules — and in production these issues also lead to inefficient hand-offs and complicated UI code.',
          ],
        },
      ],
    },
    {
      id: 'direction',
      label: 'Design Direction',
      nav: 'Direction',
      blocks: [
        {
          heading: 'A shared design system — scalable and flexible',
          paragraphs: [
            'The key is a shared design system with a style guide, design principles, and examples/templates: a solid design foundation and a shared way of working that ensures consistent, efficient design and development — efficiency for makers, and a sense of consistency for end users.',
          ],
          media: [{ src: direction, alt: 'Architecture of the shared design system' }],
        },
      ],
    },
    {
      id: 'mvp',
      label: 'The MVP Design System',
      nav: 'MVP',
      blocks: [
        {
          heading: '1. Design principles',
          media: [{ src: mvpPrinciples, alt: 'The design principles of the TACC design system' }],
        },
        {
          heading: '2. Style guide',
          paragraphs: [
            'The usage of colors and typography is defined by considering legibility, consistency, and accessibility.',
          ],
          list: [
            'Legibility — Roboto stays legible at both small and large sizes; numbers display at the same width.',
            'Consistency — purple blue as the primary action color for all TACC products.',
            'Accessibility — W3C 2.0 contrast ratios and color-blind-safe palettes.',
          ],
          media: [{ src: mvpStyleguide, alt: 'Style guide: color and typography rules' }],
        },
        {
          heading: '3. Elements',
          paragraphs: [
            'Based on the UI problems surfaced by the inventory and user research, I designed 12 kinds of common elements, each solving a specific UI problem — presenting a list of options, providing feedback, and so on. The key UI considerations:',
          ],
          list: [
            'States & hierarchies — distinct states with primary and secondary hierarchies.',
            'Standard usage — universal elements and repetitive patterns.',
            'Single signifier — reduce cognitive load; keep actions central and focused.',
          ],
          media: [{ src: mvpElements, alt: 'The elements library of the design system' }],
        },
        {
          heading: '4. Patterns',
          paragraphs: [
            'I created commonly used patterns such as data tables, forms, and modals by applying the styles and elements — considering effortlessness in taking actions, feedback through affordance and notification, and efficiency in scaling.',
          ],
          list: [
            'Effortlessness — proximity principle, metaphors, strong hierarchy.',
            'Feedback — affordance and notification.',
            'Efficiency — a 2x grid that scales across a wide variety of devices.',
          ],
          media: [{ src: mvpPatterns, alt: 'The patterns library of the design system' }],
        },
        {
          heading: '5. Iconography & graphics',
          paragraphs: [
            'Designing for present and future, the system includes a range of charts and icons for future use — considering their adaptability in future scenarios and consistency today, with clarity created by white space, limited items, and intentional motion.',
          ],
          list: [
            'Adaptability — future scenarios, current consistency.',
            'Clarity — white space, limited items, intentional motion.',
          ],
          media: [{ src: mvpIcons, alt: 'Charts and graphs library of the design system' }],
        },
      ],
    },
    {
      id: 'application',
      label: 'Application & Testing',
      nav: 'Testing',
      blocks: [
        {
          heading: 'Apply the system to the core portal, then test it',
          paragraphs: [
            'After designing the MVP design system, I applied the style guide to our core portal and redesigned it under the principles. This helps us understand how the design system works in practice, and provides the prototype to test with users. The usability testing goals:',
          ],
          list: [
            'Adoption of the patterns.',
            'How well the redesign matches users’ current workflows.',
          ],
          media: [{ src: application, alt: 'The core portal redesigned with the MVP design system' }],
          cta: { label: 'View prototype demo', href: PROTOTYPE_URL },
        },
      ],
    },
    {
      id: 'reflections',
      label: 'Next Steps & Reflections',
      nav: 'Reflections',
      blocks: [
        {
          heading: 'Next steps',
          list: [
            'Evolve from usability testing — iterate the UIs, develop the grid, standardize other products.',
            'Create best practice and guidance — patterns of best practices and a governance process.',
            'From MVP to an open, live ecosystem — delivery to development and a shared library with engineers.',
          ],
        },
        {
          heading: 'Fail fast, iterate fast',
          paragraphs: [
            'We created the MVP rapidly and applied it to the core user portal, so we could elicit feedback and iterate quickly. Because we expected to fail fast, we had more time to come back and revisit design decisions over several rounds.',
          ],
        },
        {
          heading: 'Think big enough to design for all possibilities',
          paragraphs: [
            'A scalable, extendable design system demands considering every edge case, UI state, animation, and accessibility need — with every decision validated repeatedly with users and the cross-functional team.',
          ],
        },
        {
          heading: 'Empathize with all types of users to make an impact',
          paragraphs: [
            'At first, stakeholders didn’t see much value in a design system — visual consistency didn’t seem like a priority for a cloud computing platform. But diving deeper, we realized the portal makers are users of the design system too, and their efficiency is the priority. Without thoroughly empathizing with the makers’ pain points and translating them, we would never have seen how a design system increases their efficiency — and makes an impact on the business.',
          ],
        },
      ],
    },
  ],
}
