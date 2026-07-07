// NovoEd Video Practice — case study content.
// Migrated from the original Webflow page ("Video Practice",
// wingzeng.design/video-practice). The old page's long single scroll is
// grouped into scrollable sections; its process slider becomes a grid-2
// board, the YouTube demo becomes a 'video' block, and the client
// testimonial becomes a 'quote' block. See oracle.js for the full list of
// block variants understood by ProjectPage.

import hero from '../assets/projects/novoed/hero.png'
import solPrompt from '../assets/projects/novoed/sol-prompt.png'
import solPracticeRoom from '../assets/projects/novoed/sol-practice-room.png'
import solScenarioCreation from '../assets/projects/novoed/sol-scenario-creation.png'
import process1 from '../assets/projects/novoed/process-1.png'
import process2 from '../assets/projects/novoed/process-2.png'
import process3 from '../assets/projects/novoed/process-3.png'
import process4 from '../assets/projects/novoed/process-4.png'
import process5 from '../assets/projects/novoed/process-5.png'
import process6 from '../assets/projects/novoed/process-6.png'

const PROCESS_NOTE =
  'This page only covers a portion of the design process. If you wish to learn more details, please feel free to contact me.'

export const NOVOED = {
  slug: 'novoed',
  name: 'NovoEd',
  tag: 'Video Practice',
  title: 'Enhance Capability Building Through Video Practice',
  subtitle:
    'An engaging learning activity that promotes practice, peer learning, and feedback via customizable video-based scenarios.',
  meta: [
    { label: 'Company', value: 'NovoEd' },
    { label: 'Role', value: 'Design Lead' },
    { label: 'Scope', value: 'From 0 to 1 feature' },
    { label: 'Platform', value: 'Enterprise web' },
  ],
  // The cover art is a 1:1 illustration — crop it to a wide editorial band
  // (the camera + browser sit in the middle) instead of a viewport-tall square.
  hero: {
    src: hero,
    alt: 'NovoEd Video Practice, cover illustration',
    aspect: '2 / 1',
  },
  sections: [
    {
      id: 'overview',
      label: 'Overview',
      nav: 'Overview',
      blocks: [
        {
          variant: 'lead',
          heading: 'A place of proof for learning outcomes, from 0 to 1',
          paragraphs: [
            'To provide a strong place of proof for learning outcomes — often a missing component of corporate learning experiences — I, as the design owner of Video Practice, helped craft this engaging learning activity for learners, promoting practice, peer learning, and feedback via customizable video-based scenarios. It also enables course builders to easily create practice scenarios with video- and/or text-based prompts, giving feedback that helps learners establish confidence and efficacy while continuously sharpening their skills. NovoEd’s global partners and clients regard this natively supported experience as “another significant milestone” and “the game changer” in the corporate learning market.',
          ],
          cta: {
            label: 'View news release',
            href: 'https://www.novoed.com/company/news-press/novoed-announces-release-of-video-practice-learning-experience/',
          },
        },
        {
          variant: 'video',
          heading: 'Video Practice in one minute',
          youtubeId: 'naDQmlYCtnM',
          title: 'NovoEd Video Practice — product demo',
        },
      ],
    },
    {
      id: 'challenge',
      label: 'The Challenge',
      nav: 'Challenge',
      blocks: [
        {
          heading: 'A strong place of proof for learning outcomes is missing in corporate learning',
          paragraphs: [
            'Accommodating the new reality of working and learning from home, NovoEd gained its fastest growth in the period as an online learning platform for corporate customers. Learning needs among users transformed from offline to online, including the core needs to successfully build capabilities such as effective employee onboarding, leadership development, sales enablement, and customer service skill-building.',
            'However, intensive learning that goes beyond knowledge acquisition to include awareness, social context, and courageous action is often a missing component of corporate learning experiences. Multiple customers had to license separate video practice and role-play tools in order to prepare learners to confront a volatile, uncertain, complex, and ambiguous world with confidence and purpose.',
          ],
        },
        {
          variant: 'lead',
          heading:
            'How might we promote practice to enhance capability building in the corporate learning experience?',
        },
      ],
    },
    {
      id: 'solution',
      label: 'The Solution',
      nav: 'Solution',
      blocks: [
        {
          heading: 'Rehearse real-world scenarios, in and outside of a course',
          media: [{ src: solPrompt, alt: 'A video practice prompt with recorded learner responses' }],
          paragraphs: [
            'Video Practice enables learners to rehearse real-world scenarios that drive deep-learning skills directly in and outside of a course. Different practice flows fit various learning types — learners can practice on the spot or respond when ready — and can be configured by admins.',
          ],
        },
        {
          heading: 'The Practice Room',
          media: [{ src: solPracticeRoom, alt: 'The Practice Room with peer videos and feedback' }],
          paragraphs: [
            'The Practice Room enables learners to refine skills through continuous skill development and peer review. Learners may view others’ practice videos, give and receive feedback, and apply these learnings with additional practice for skill proficiency.',
          ],
        },
        {
          heading: 'Scenario creation for course builders',
          media: [{ src: solScenarioCreation, alt: 'Admin flow for creating a video practice scenario' }],
          paragraphs: [
            'Course builders may create video practice scenarios with a prompt that learners respond to as a video submission directly in the app. After responding, learners can review and study peer work, view featured submissions, give and receive feedback, and continually practice to build skills.',
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
          heading: 'From business idea to agile design tasks',
          paragraphs: [
            'As the lead designer who owned this problem, I addressed how we might promote practice to enhance deep capability building in the corporate learning experience. After carefully defining the user needs, synthesizing the flows, and many rounds of research, prototyping, testing, and iteration, I designed and helped release the major component of Video Practice: an engaging learning activity and a suite of features that let learners rehearse real-world scenarios directly in and outside of a course.',
            'The boards below sample that workflow — from business idea to design concept, user flows and wireframes, through to agile design tasks:',
          ],
          media: [
            { src: process1, alt: 'Process board: translating the business idea' },
            { src: process2, alt: 'Process board: breaking the idea into sub-goals' },
            { src: process3, alt: 'Process board: design concept exploration' },
            { src: process4, alt: 'Process board: user flow mapping' },
            { src: process5, alt: 'Process board: agile design task breakdown' },
            { src: process6, alt: 'Process board: wireframe sample' },
          ],
          variant: 'grid-2',
          note: PROCESS_NOTE,
        },
      ],
    },
    {
      id: 'impact',
      label: 'Impact',
      nav: 'Impact',
      blocks: [
        {
          variant: 'quote',
          quote:
            '“Another milestone for an immersive experience ensuring that learning transfers to behavior change and improved performance.”',
          attribution: 'Ed Emde, President, Wilson Learning',
          paragraphs: [
            '“NovoEd’s ongoing commitment to the innovation and evolution of its state-of-the-art learning and collaboration platform has reached yet another significant milestone with the launch of its Video Practice. This integrated capability is a game changer from our perspective in terms of enhancing the interactive and immersive quality of the learning experience and ensuring that learning transfers to behavior change and improved performance.”',
          ],
        },
        {
          heading: 'What I learnt',
          list: [
            'Translate the business idea into user-centered design tasks.',
            'Create a punch-list of deliverables for each phase.',
            'Set up regular sync-up days and huddles with stakeholders.',
            'Explore every corner towards design solutions in the wireframe phase.',
            'Fail fast and iterate with internal usability testings.',
            'Include the thought process behind the scenes when presenting design solutions — it helps to articulate rationales.',
          ],
        },
      ],
    },
  ],
}
