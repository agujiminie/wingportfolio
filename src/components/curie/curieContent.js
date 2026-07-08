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
    detailType: 'diff', // opens the code-diff panel (see TASK_DIFF)
  },
  {
    id: '#45633',
    title: 'Insert Account into SAP Customer Master',
    statusActive: 'Configuring SAP connector...',
    finalProgress: 'completed',
    detailType: 'files', // opens the Summary + All Flows file browser
  },
]

export const TASK_PANEL_TITLE = 'Tasks in this chat'

// Task detail side panel (Figma workflow-automation, node 1045-32850). Opens
// as a split-screen pane when a task card is clicked. Two variants, keyed by
// TASK_CARDS[].detailType:
//   'diff'  → TASK_DIFF   (code-diff card, layout referenced from Figma
//             "Demo - Agentic UX" node 38-38606; recolored to Curie's own
//             tokens and set in Geist Mono to stay 1:1 with the rest of the
//             demo instead of that file's Source Code Pro)
//   'files' → TASK_DETAIL (Summary + All Flows file browser, unchanged)
export const TASK_PANEL_DOWNLOAD = 'Download All'

// `segments` are minimal manual tokens (kw = keyword, str = string/type
// literal); everything else renders in the body ink. old/new are the
// unified-diff line numbers — null on the side a line doesn't exist on.
export const TASK_DIFF = {
  fileName: 'account-transform.dwl',
  language: 'DataWeave',
  added: 9,
  removed: 2,
  lines: [
    { type: 'ctx', old: 1, new: 1, segments: [{ t: '%dw', k: 'kw' }, { t: ' 2.0' }] },
    {
      type: 'ctx',
      old: 2,
      new: 2,
      segments: [{ t: 'output', k: 'kw' }, { t: ' application/json' }],
    },
    { type: 'ctx', old: 3, new: 3, segments: [{ t: '---' }] },
    { type: 'ctx', old: 4, new: 4, segments: [{ t: '{' }] },
    { type: 'ctx', old: 5, new: 5, segments: [{ t: '  accountId: payload.Id,' }] },
    { type: 'ctx', old: 6, new: 6, segments: [{ t: '  name: payload.Name,' }] },
    { type: 'del', old: 7, new: null, segments: [{ t: '  phone: payload.Phone,' }] },
    {
      type: 'add',
      old: null,
      new: 7,
      segments: [
        { t: '  phone: payload.Phone ' },
        { t: 'default', k: 'kw' },
        { t: ' ' },
        { t: '""', k: 'str' },
        { t: ',' },
      ],
    },
    { type: 'add', old: null, new: 8, segments: [{ t: '  billingAddress: {' }] },
    {
      type: 'add',
      old: null,
      new: 9,
      segments: [{ t: '    street: payload.BillingStreet,' }],
    },
    { type: 'add', old: null, new: 10, segments: [{ t: '    city: payload.BillingCity,' }] },
    {
      type: 'add',
      old: null,
      new: 11,
      segments: [{ t: '    state: payload.BillingState,' }],
    },
    {
      type: 'add',
      old: null,
      new: 12,
      segments: [{ t: '    postalCode: payload.BillingPostalCode' }],
    },
    { type: 'add', old: null, new: 13, segments: [{ t: '  },' }] },
    { type: 'ctx', old: 8, new: 14, segments: [{ t: '  industry: payload.Industry,' }] },
    {
      type: 'del',
      old: 9,
      new: null,
      segments: [{ t: '  lastModifiedDate: payload.LastModifiedDate' }],
    },
    {
      type: 'add',
      old: null,
      new: 15,
      segments: [
        { t: '  lastModifiedDate: payload.LastModifiedDate ' },
        { t: 'as', k: 'kw' },
        { t: ' ' },
        { t: 'DateTime', k: 'str' },
      ],
    },
    {
      type: 'add',
      old: null,
      new: 16,
      segments: [
        { t: '    {format: ' },
        { t: "\"yyyy-MM-dd'T'HH:mm:ss\"", k: 'str' },
        { t: '}' },
      ],
    },
    { type: 'ctx', old: 10, new: 17, segments: [{ t: '}' }] },
  ],
}

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
