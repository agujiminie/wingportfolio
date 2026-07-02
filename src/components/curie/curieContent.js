// Copy + data for the Curie demo. Sourced from the Figma landing frame
// (node 3309-2020) plus the two tasks Curie generates on screen 2.

export const PROMPT =
  'Create a Mule 4 flow that retrieves an Account record from the Salesforce ' +
  'connector, updates specific fields in the Account details such as phone ' +
  'number, billing address, and last modified date, then inserts into SAP.'

export const REPOS = 'curie-dev/osb-edi-app, curie-prod/fds'

export const WORKSPACE = 'Workspace A'
export const USER = { name: 'Alex Parthenthia', initials: 'AP' }

// Sidebar task history (Tasks tab).
export const SIDEBAR_TASKS = [
  { id: '#45632', time: '13m', name: 'Task name - Add a flow' },
  { id: '#45631', time: '52m', name: 'Task name - Add a flow' },
]
export const SIDEBAR_DATE = 'OCT 13, 2025'
export const SIDEBAR_TASKS_OLDER = [
  { id: '#45628', time: '1d', name: 'Task name - Add a flow' },
]

// Quick-action tab bar under the landing composer.
export const ACTIONS = [
  { id: 'coding', label: 'Coding', icon: 'code' },
  { id: 'testing', label: 'Testing', icon: 'flask' },
  { id: 'document', label: 'Document', icon: 'document' },
  { id: 'migration', label: 'Migration', icon: 'swap' },
]

// Curie's reply + the two tasks it spins up (screen 2).
export const REPLY =
  "Got it. I've split this into two tasks and started working on them — " +
  'you can track each one in the Tasks panel.'

export const GENERATED_TASKS = [
  {
    id: '#45633',
    status: 'In progress',
    variant: 'active',
    time: 'just now',
    name: 'Retrieve & update Salesforce Account',
    sub: 'Salesforce connector · update phone, billing address, last modified date',
  },
  {
    id: '#45634',
    status: 'Queued',
    variant: 'queued',
    time: 'just now',
    name: 'Insert transformed record into SAP',
    sub: 'SAP connector · map Account payload → BAPI insert',
  },
]
