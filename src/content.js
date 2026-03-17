import workScene from './assets/landing/work-scene.png'
import playgroundScene from './assets/landing/playground-scene.png'
import analogueScene from './assets/landing/analogue-scene.png'
import morphFrame1 from './assets/landing/morph-1.png'
import morphFrame2 from './assets/landing/morph-2.png'
import morphFrame3 from './assets/landing/morph-3.png'
import morphFrame4 from './assets/landing/morph-4.png'

export const STATES = [
  {
    id: 'work',
    label: 'Latest Work',
    pillLabel: 'LATEST WORK',
    gradientBottom: 'rgba(232, 199, 108, 0.7)',
    activeFill: '#e8ab69',
    activeText: '#3f3929',
    blobColor: '#ffcc32',
    blobTransform: 'translate(-18%, 10%) rotate(-12deg)',
    blobWidth: '52%',
    blobHeight: '56%',
    shadowColor: 'rgba(111, 101, 68, 0.15)',
    shadowTransform: 'translate(14%, -8%) rotate(18deg)',
    shadowWidth: '58%',
    shadowHeight: '24%',
    scene: workScene,
    imageWidth: 0.63,
    imageOffsetX: 0.005,
    imageOffsetY: 0.15,
    imageRotation: -0.01,
  },
  {
    id: 'playground',
    label: 'AI Playground',
    pillLabel: 'AI PLAYGROUND',
    gradientBottom: 'rgba(78, 195, 216, 0.7)',
    activeFill: 'rgba(0, 179, 211, 0.43)',
    activeText: '#2d3d40',
    blobColor: '#3f61ff',
    blobTransform: 'translate(2%, 7%) rotate(18deg)',
    blobWidth: '36%',
    blobHeight: '63%',
    shadowColor: 'rgba(87, 141, 164, 0.16)',
    shadowTransform: 'translate(20%, 3%) rotate(16deg)',
    shadowWidth: '52%',
    shadowHeight: '24%',
    scene: playgroundScene,
    imageWidth: 0.5,
    imageOffsetX: -0.02,
    imageOffsetY: 0.12,
    imageRotation: 0.03,
  },
  {
    id: 'analogue',
    label: 'Analog',
    pillLabel: 'ANALOG',
    gradientBottom: 'rgba(96, 123, 47, 0.7)',
    activeFill: 'rgba(96, 123, 47, 0.43)',
    activeText: '#2d3d40',
    blobColor: '#eaecd8',
    blobTransform: 'translate(-12%, 14%) rotate(-11deg)',
    blobWidth: '44%',
    blobHeight: '70%',
    shadowColor: 'rgba(66, 88, 48, 0.22)',
    shadowTransform: 'translate(-18%, 12%) rotate(-26deg)',
    shadowWidth: '44%',
    shadowHeight: '72%',
    scene: analogueScene,
    imageWidth: 0.54,
    imageOffsetX: 0.035,
    imageOffsetY: 0.17,
    imageRotation: -0.02,
  },
]

export const STATE_BY_ID = Object.fromEntries(STATES.map((state) => [state.id, state]))

export const ORDER_BY_ACTIVE = {
  work: ['analogue', 'work', 'playground'],
  playground: ['work', 'playground', 'analogue'],
  analogue: ['playground', 'analogue', 'work'],
}

export const SWITCH_SLOTS = [
  {
    left: '0',
    width: 'var(--side-pill-width)',
  },
  {
    left: 'calc(var(--side-pill-width) + var(--pill-gap))',
    width: 'var(--active-pill-width)',
  },
  {
    left: 'calc(var(--side-pill-width) + var(--pill-gap) + var(--active-pill-width) + var(--pill-gap))',
    width: 'var(--side-pill-width)',
  },
]

export const MORPH_FRAMES = [morphFrame1, morphFrame2, morphFrame3, morphFrame4]
