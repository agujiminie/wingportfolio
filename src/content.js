import workScene from './assets/optimized/work-art.jpg'
import playgroundScene from './assets/optimized/playground-art.jpg'
import analogueScene from './assets/optimized/analogue-art.jpg'
import workTexture from './assets/optimized/work-texture.jpg'
import playgroundTexture from './assets/optimized/playground-texture.jpg'
import analogueTexture from './assets/optimized/analogue-texture.jpg'
import morphFrame1 from './assets/landing/morph-1.jpg'
import morphFrame2 from './assets/landing/morph-2.jpg'
import morphFrame3 from './assets/landing/morph-3.jpg'
import morphFrame4 from './assets/landing/morph-4.jpg'

export const NAV_LINKS = [
  { href: '#overview', label: 'Overview' },
  { href: '#tracks', label: 'Tracks' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#contact', label: 'Contact' },
]

export const METRICS = [
  { value: '8+', label: 'years shaping AI product experiences' },
  { value: '3', label: 'active creative lanes in rotation' },
  { value: 'React + Vite', label: 'stack behind this portfolio build' },
]

export const STATES = [
  {
    id: 'work',
    label: 'Latest Work',
    pillLabel: 'Latest Work',
    gradientBottom: 'rgba(232, 199, 108, 0.72)',
    activeFill: '#ebbb73',
    activeText: '#3b321f',
    blobColor: '#ffcf35',
    blobTransform: 'translate(-2%, 16%) rotate(-10deg)',
    blobWidth: '54%',
    blobHeight: '60%',
    shadowColor: 'rgba(112, 104, 73, 0.16)',
    shadowTransform: 'translate(18%, 0%) rotate(18deg)',
    shadowWidth: '62%',
    shadowHeight: '24%',
    scene: workScene,
    texture: workTexture,
    imageWidth: 0.88,
    imageOffsetX: 0.005,
    imageOffsetY: 0.12,
    imageRotation: -0.01,
    kicker: 'Shipped product surfaces',
    title: 'AI product design that holds up from strategy deck to launch UI.',
    description:
      'I translate fuzzy product ideas into legible flows, visual systems, and interaction patterns that can survive real engineering constraints.',
    deliverables: [
      'Product framing, UX architecture, and launch-ready interface systems',
      'High-fidelity design direction with motion and edge-state thinking',
      'Developer handoff that keeps the original product narrative intact',
    ],
    focus: 'Best for teams shipping new AI features, design systems, or zero-to-one product bets.',
  },
  {
    id: 'playground',
    label: 'AI Playground',
    pillLabel: 'AI Playground',
    gradientBottom: 'rgba(80, 195, 216, 0.72)',
    activeFill: '#6bd6eb',
    activeText: '#213338',
    blobColor: '#395fff',
    blobTransform: 'translate(9%, 10%) rotate(18deg)',
    blobWidth: '38%',
    blobHeight: '63%',
    shadowColor: 'rgba(76, 132, 157, 0.16)',
    shadowTransform: 'translate(24%, 4%) rotate(16deg)',
    shadowWidth: '56%',
    shadowHeight: '24%',
    scene: playgroundScene,
    texture: playgroundTexture,
    imageWidth: 0.6,
    imageOffsetX: -0.02,
    imageOffsetY: 0.18,
    imageRotation: 0.03,
    kicker: 'Fast experiments',
    title: 'Prototype loops for generative interfaces, motion, and interaction ideas.',
    description:
      'This lane is where I test behaviors before they calcify into product logic: AI prompting patterns, system feedback, transitions, and weird-but-useful interaction ideas.',
    deliverables: [
      'Rapid interface concepts to pressure-test new AI behaviors',
      'Motion studies that explain state change instead of decorating it',
      'Experimental build fragments that can become product features',
    ],
    focus: 'Best for prototype sprints, concept validation, and directional R&D.',
  },
  {
    id: 'analogue',
    label: 'Analog',
    pillLabel: 'Analog',
    gradientBottom: 'rgba(96, 123, 47, 0.74)',
    activeFill: '#becd9f',
    activeText: '#293727',
    blobColor: '#edf0de',
    blobTransform: 'translate(-8%, 18%) rotate(-10deg)',
    blobWidth: '48%',
    blobHeight: '74%',
    shadowColor: 'rgba(69, 94, 49, 0.22)',
    shadowTransform: 'translate(-16%, 18%) rotate(-26deg)',
    shadowWidth: '44%',
    shadowHeight: '72%',
    scene: analogueScene,
    texture: analogueTexture,
    imageWidth: 0.68,
    imageOffsetX: 0.035,
    imageOffsetY: 0.22,
    imageRotation: -0.02,
    kicker: 'Material sensibility',
    title: 'Editorial composition, tactile references, and offline craft feeding digital work.',
    description:
      'Analog studies keep the digital work from getting generic. Texture, restraint, composition, and material references help the interface feel authored instead of template-driven.',
    deliverables: [
      'Visual studies, composition references, and tactile direction',
      'Mood-building inputs that sharpen digital art direction',
      'A stronger point of view for brand, interface, and motion choices',
    ],
    focus: 'Best when a product needs more character, depth, and visual memory.',
  },
]

export const STATE_BY_ID = Object.fromEntries(STATES.map((state) => [state.id, state]))

export const ORDER_BY_ACTIVE = {
  work: ['analogue', 'work', 'playground'],
  playground: ['work', 'playground', 'analogue'],
  analogue: ['playground', 'analogue', 'work'],
}

export const MORPH_FRAMES = [morphFrame1, morphFrame2, morphFrame3, morphFrame4]

export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Frame the product story',
    text:
      'Start with user intent, the product narrative, and the exact behavior the interface needs to make legible.',
  },
  {
    step: '02',
    title: 'Shape the system',
    text:
      'Translate the story into content hierarchy, visual language, responsive rules, and motion principles that can scale.',
  },
  {
    step: '03',
    title: 'Build with constraints',
    text:
      'Implement real components, watch performance budgets, and make accessibility part of the design pass instead of cleanup.',
  },
  {
    step: '04',
    title: 'Verify and ship',
    text:
      'Run browser QA, tighten assets, and hand the work off in a branch that engineering can review without guesswork.',
  },
]

export const PRINCIPLES = [
  {
    title: 'Clarity before novelty',
    text:
      'AI products need obvious state changes, trust signals, and next actions before they need visual tricks.',
  },
  {
    title: 'Motion with a job',
    text:
      'Animation should explain transition, sequence, or focus. If it cannot do that, it should probably leave.',
  },
  {
    title: 'Systems over one-off screens',
    text:
      'A strong portfolio shows repeatable design judgment, not isolated mockups that collapse during implementation.',
  },
]

export const STACK = [
  'React 19',
  'Vite 7',
  'Responsive CSS architecture',
  'Canvas-driven motion study',
  'Accessibility-minded semantic structure',
  'Branch-ready build workflow',
]
