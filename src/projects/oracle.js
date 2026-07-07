// Oracle Service Center Console — case study content.
// Migrated from the original Webflow page ("2.0 Oracle Service Center Console",
// wingzeng.design/oracle-service-center-console-wing-zeng). The old page's
// nested tab groups are flattened into scrollable sections; each former
// sub-tab is a block. The old hero image (a NovoEd "video practice" leftover)
// is replaced by the product overview GIF, framed as a macOS window to echo
// the landing page's Curie demo.
//
// Block variants understood by ProjectPage:
//   'lead'          heading + large intro paragraphs
//   'split'         statement + media side by side (media right)
//   'split-reverse' statement + media side by side (media left)
//   'grid-2'        heading? + media laid out in a 2-column grid + note?
//   'feature-grid'  items[], each { heading, paragraphs, media } in a 2-col grid
//   (default)       heading? + paragraphs? + full-width media stack + note?

import overview from '../assets/projects/oracle/overview.gif'
import illusUnified from '../assets/projects/oracle/illus-unified.png'
import illusInsights from '../assets/projects/oracle/illus-insights.png'
import illusResponse from '../assets/projects/oracle/illus-response.png'
import problemsUser from '../assets/projects/oracle/problems-user.png'
import problems1 from '../assets/projects/oracle/problems-1.png'
import problems2 from '../assets/projects/oracle/problems-2.png'
import problems3 from '../assets/projects/oracle/problems-3.png'
import designQuestions from '../assets/projects/oracle/design-questions.png'
import clients from '../assets/projects/oracle/clients.png'
import solUnified from '../assets/projects/oracle/sol-unified.gif'
import solContext from '../assets/projects/oracle/sol-context.gif'
import solResponse from '../assets/projects/oracle/sol-response.gif'
import solWorkspace from '../assets/projects/oracle/sol-workspace.gif'
import solSnippets from '../assets/projects/oracle/sol-snippets.gif'
import featDashboard from '../assets/projects/oracle/feat-dashboard.png'
import featProfile from '../assets/projects/oracle/feat-profile.png'
import featMedia1 from '../assets/projects/oracle/feat-media-1.png'
import featMedia2 from '../assets/projects/oracle/feat-media-2.png'
import featSearch from '../assets/projects/oracle/feat-search.png'
import processLayout1 from '../assets/projects/oracle/process-layout-1.png'
import processLayout2 from '../assets/projects/oracle/process-layout-2.png'
import processLayout3 from '../assets/projects/oracle/process-layout-3.png'
import processLayout4 from '../assets/projects/oracle/process-layout-4.png'
import processAi1 from '../assets/projects/oracle/process-ai-1.png'
import processAi2 from '../assets/projects/oracle/process-ai-2.png'
import processAi3 from '../assets/projects/oracle/process-ai-3.png'
import processAi4 from '../assets/projects/oracle/process-ai-4.png'
import processAi5 from '../assets/projects/oracle/process-ai-5.png'
import processAi6 from '../assets/projects/oracle/process-ai-6.png'
import impactMetrics from '../assets/projects/oracle/impact-metrics.png'
import impactFeedback from '../assets/projects/oracle/impact-feedback.png'

const PROCESS_NOTE =
  'This page only covers a portion of the design process. If you wish to learn more details, please feel free to contact me.'

export const ORACLE = {
  slug: 'oracle',
  name: 'Oracle',
  tag: 'AI Service Platform',
  title: 'Empower Agents & Boost Customer Satisfaction',
  subtitle: 'With the Help of Gen-AI and Automation',
  meta: [
    { label: 'Company', value: 'Oracle' },
    { label: 'Role', value: 'Lead Product Designer' },
    { label: 'Scope', value: 'Zero to one' },
    { label: 'Reach', value: '110,000+ service agents' },
  ],
  // No windowTitle: the overview GIF already carries its own browser chrome,
  // so the template renders it plain instead of adding a second macOS bar.
  hero: {
    src: overview,
    alt: 'Oracle Service Center Console, product overview',
  },
  sections: [
    {
      id: 'overview',
      label: 'Overview',
      nav: 'Overview',
      blocks: [
        {
          variant: 'lead',
          heading: 'Gen-AI Powered Unified Customer Service, from 0 to 1',
          paragraphs: [
            'In order to improve the efficiency of current customer service chats and enhance customer satisfaction, I led the design of a next-generation service center console. This product consolidates all customer chats and tools (such as emails and order system) into a single tab to establish a unified workflow for agents. Through AI capabilities, the key context of the chat, responses, and resolutions appear at the right place and time. This has been proven to significantly reduce the Average Handling Time (AHT) for service agents, and it is expected to positively impact over 110,000 service agents.',
          ],
        },
        {
          variant: 'split',
          heading: 'Enable multi-chats for customer agents in just one page. No switching between tools.',
          media: [{ src: illusUnified, alt: 'Illustration of the unified experience across chats and tools' }],
        },
        {
          variant: 'split-reverse',
          heading: 'Provide Real-time Insights to save time on troubleshooting.',
          media: [{ src: illusInsights, alt: 'Illustration of real-time insights during a chat' }],
        },
        {
          variant: 'split',
          heading: 'Provide AI-assisted response to reduce frictions during multi-chats.',
          media: [{ src: illusResponse, alt: 'Illustration of AI-assisted response suggestions' }],
        },
        {
          heading: 'Design System Integration',
          paragraphs: [
            'Additionally, I introduced new Gen-AI design components to the Redwood Design System (RDS). This streamlined workflows across Oracle fusion apps such as HRM, Sales, and Knowledge Management.',
          ],
        },
        {
          heading: 'The Clients',
          media: [{ src: clients, alt: 'Client landscape for the service center console', flush: true }],
        },
        {
          heading: 'The Problems',
          paragraphs: [
            'Fragmented tools and constant context switching were slowing agents down. Research surfaced the pain points below and the design questions that framed the work.',
          ],
          media: [
            { src: problemsUser, alt: 'Agent persona and pain points' },
            { src: problems2, alt: 'Problem analysis: fragmented tools and context switching' },
            { src: problems1, alt: 'Problem analysis: the current agent workflow' },
            { src: problems3, alt: 'Problem analysis: inefficiencies in the service flow' },
            { src: designQuestions, alt: 'The key design questions' },
          ],
        },
      ],
    },
    {
      id: 'solutions',
      label: 'Core Solutions',
      nav: 'Solutions',
      blocks: [
        {
          heading: 'Unified Experience',
          media: [{ src: solUnified, alt: 'Unified one-page console with a built-in workspace' }],
          paragraphs: [
            'We offer a unified experience on this one-page platform, which allows easy switching between chats. Instead of navigating through various tools and webpages, agents can access all necessary tools within the built-in workspace. This feature enables them to address issues without leaving the chat.',
          ],
        },
        {
          heading: 'Key Context Summary',
          media: [{ src: solContext, alt: 'Chat header summarising customer context' }],
          paragraphs: [
            'With chat header on top of the customer live chat, agents can instantly identify the customer, understand their issue, and grasp contextual insights before engaging.',
          ],
        },
        {
          heading: 'AI-assisted Response',
          media: [{ src: solResponse, alt: 'AI-suggested chat snippets' }],
          paragraphs: [
            'Chat snippets empower agents to swiftly provide relevant responses and precise knowledge sharing.',
          ],
        },
        {
          heading: 'AI-powered Resolution Workspace',
          media: [{ src: solWorkspace, alt: 'Workspace with AI-recommended actions and smart search' }],
          paragraphs: [
            'The workspace with AI-recommended actions, smart search, and product insights based on semantic analysis and customer identification.',
          ],
        },
        {
          heading: 'Auto-copied Snippets',
          media: [{ src: solSnippets, alt: 'Auto-generated, pre-filled tickets from chat context' }],
          paragraphs: [
            'Classify, generate, and fill tickets based on chat and customer identification.',
          ],
        },
      ],
    },
    {
      id: 'features',
      label: 'More Features',
      nav: 'Features',
      blocks: [
        {
          variant: 'feature-grid',
          items: [
            {
              heading: 'Goal & Metrics Tracking',
              media: [{ src: featDashboard, alt: 'Agent dashboard with tasks, goals and metrics' }],
              paragraphs: [
                'Every agent has their own dashboard to keep track of tasks and goals. They can start their day seeing their primary tasks and metrics, know what to do if there is no live chat assigned, and identify areas for improvement.',
              ],
            },
            {
              heading: 'Profile Management',
              media: [{ src: featProfile, alt: 'Customer profile management inside the console' }],
              paragraphs: [
                'Agents can quickly match, add, or update profiles for customers not already in the system. I designed an easy way to access profile management integrated within the Oracle CRM system.',
              ],
            },
            {
              heading: 'Media Sharing',
              media: [
                { src: featMedia1, alt: 'Sharing inline images during a chat' },
                { src: featMedia2, alt: 'Sharing attachments during a chat' },
              ],
              paragraphs: [
                'Agents can share various forms of media with customers during communication, including inline images and attachments. Different interaction flows are incorporated to handle these seamlessly.',
              ],
            },
            {
              heading: 'Search and Beyond',
              media: [{ src: featSearch, alt: 'Action bar with search and primary actions' }],
              paragraphs: [
                'The action bar on top functions as a search bar and beyond. An agent can search keywords, or when clicking on it, it offers primary actions related to the task at hand: creating and managing contact profiles, searching knowledge bases, creating notes or emails, directly from the workspace.',
              ],
            },
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
          heading: 'Layout Design',
          media: [
            { src: processLayout1, alt: 'Layout exploration, alternative 1' },
            { src: processLayout2, alt: 'Layout exploration, alternative 2' },
            { src: processLayout3, alt: 'Layout exploration, alternative 3' },
            { src: processLayout4, alt: 'Layout exploration, alternative 4' },
          ],
        },
        {
          variant: 'grid-2',
          heading: 'AI Design Process',
          media: [
            { src: processAi1, alt: 'AI design process, exploration 1' },
            { src: processAi2, alt: 'AI design process, exploration 2' },
            { src: processAi3, alt: 'AI design process, exploration 3' },
            { src: processAi4, alt: 'AI design process, iteration detail 1' },
            { src: processAi5, alt: 'AI design process, iteration detail 2' },
            { src: processAi6, alt: 'AI design process, iteration detail 3' },
          ],
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
          heading: 'Success Metrics',
          media: [{ src: impactMetrics, alt: 'Success metrics for the new console', flush: true }],
        },
        {
          heading: 'Customer Feedback',
          media: [{ src: impactFeedback, alt: 'Customer feedback quotes', flush: true }],
        },
      ],
    },
  ],
}
