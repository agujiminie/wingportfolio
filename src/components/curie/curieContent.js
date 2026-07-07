// Copy + data for the Curie demo. Sourced from the Curie Design System frame
// `expanded - hover` (node 3541-2654) plus the two tasks Curie generates on
// screen 2 (from the earlier landing frame, node 3309-2020).

export const PROMPT =
  'Create a Mule 4 flow that retrieves an Account record from the Salesforce ' +
  'connector, updates specific fields in the Account details such as phone ' +
  'number, billing address, and last modified date, then inserts into SAP.'

export const REPOS = 'curie-dev/osb-edi-app, curie-prod/fds'

export const WORKSPACE = 'Workspace A'
export const USER = { name: 'Alex Parthenthia', initials: 'AP' }

// Sidebar chat history (Chats tab) — exact copy from node 3541-2654.
export const SIDEBAR_CHATS = [
  { id: 'sf-sap', name: 'Salesforce to SAP Integration', time: '2 mins ago' },
  { id: 'order-api', name: 'Order API spec', time: 'Yesterday' },
  { id: 'workday', name: 'WorkDay integration', time: 'Oct 13, 2024' },
  { id: 'docs', name: 'Build documentation', time: 'Oct 13, 2024' },
  { id: 'tibco', name: 'Migrate from TIBCO to MuleSoft', time: 'Oct 16, 2024' },
]

// Quick-action tab bar under the landing composer.
export const ACTIONS = [
  { id: 'coding', label: 'Coding', icon: 'code' },
  { id: 'testing', label: 'Testing', icon: 'flask' },
  { id: 'document', label: 'Document', icon: 'document' },
  { id: 'migration', label: 'Migration', icon: 'swap' },
]

// Screen 2 — the chat flow (Figma "Phase 2 - Single Agent UX", node 386-17414;
// header from node 386-17478).
export const CHAT_TITLE = 'Chat: Salesforce to SAP Integration'
export const WORKED_LABEL = 'Worked for 31s'

export const CHAT_INTRO = {
  lead:
    'Your complete Salesforce to SAP integration flow is being generated. ' +
    'The task will create a full MuleSoft project with:',
  bullets: [
    'HTTP endpoint for triggering the flow',
    'Salesforce connector configuration and Account retrieval',
    'Data transformation with field updates (phone, billing address, timestamp)',
    'SAP connector integration for Customer Master data',
    'Complete error handling and logging',
    'Environment configurations and dependencies',
  ],
}

export const CHAT_FOLLOWUP =
  'Help me start the Salesforce to SAP integration flow based on current context'

export const CHAT_ACK =
  'Sure. This spec spans two systems, so I initiated a task for each side ' +
  'of the integration. Both build in parallel against the shared Account payload:'

// Task-card progress states — exact copy per the Task Flow User Journey
// Figma (nodes 1-39746 in progress, 1-39789 completed, 5-3582 input needed;
// hover variants 5-4158 / 5-4175 / 5-4191). Status reads through the icon
// plate + footer line; the panel keeps its own colorful tags.
export const TASK_PROGRESS = {
  inprogress: { panelTag: 'In Progress' },
  completed: { panelTag: 'Completed', status: 'View results in canvas' },
  input: { panelTag: 'Input Needed', status: 'Please add input in the task to continue.' },
}

// One prompt → two tasks: the spec crosses the Salesforce/SAP boundary, and
// each side gets its own agent (connector config, mapping, error semantics).
// Both start in progress; after a beat they settle into their final states so
// the demo shows the full card-state range.
export const TASK_CARDS = [
  {
    id: '#45632',
    title: 'Retrieve & transform Salesforce Account',
    statusActive: 'Generating DataWeave transformation...',
    finalProgress: 'completed',
  },
  {
    id: '#45633',
    title: 'Insert Account into SAP Customer Master',
    statusActive: 'Configuring SAP connector...',
    finalProgress: 'input',
  },
]

export const TASK_PANEL_TITLE = 'Tasks in this chat'

// Task detail side panel (Figma workflow-automation, node 1045-32850). Opens
// as a split-screen pane when a task card is clicked. Content mirrors the
// Figma frame's Summary + All Flows sections.
export const TASK_PANEL_DOWNLOAD = 'Download All'
export const TASK_DETAIL = {
  sections: [
    {
      id: 'summary',
      title: 'Summary',
      subtitle: 'High-level overview of test results',
      files: [
        'MuleSoft Project 20250810.json',
        'Salesforce Integration 20250915.json',
        'API Development 20251001.json',
      ],
    },
    {
      id: 'all-flows',
      title: 'All Flows',
      subtitle: 'Combined JSON of all tested flows.',
      tree: [
        {
          name: 'Mule flow 2',
          children: [
            'Salesforce Integration 20250915.json',
            'Data Migration 20251001.json',
            'API Documentation 20251618.md',
          ],
        },
        { name: 'Mule flow 3' },
        { name: 'Mule flow 4' },
        { name: 'Mule flow 5' },
      ],
    },
  ],
}
