import analogueArt from './assets/figma/analogue-art.png'
import analogueShadowMask from './assets/figma/analogue-shadow-mask.svg'
import analogueVector from './assets/figma/analogue-vector.svg'
import backgroundGrain from './assets/figma/background-grain.png'
import playgroundArt from './assets/figma/playground-art.png'
import playgroundShadowMask from './assets/figma/playground-shadow-mask.svg'
import playgroundVector from './assets/figma/playground-vector.svg'
import workArt from './assets/figma/work-art.png'
import workShadowMask from './assets/figma/work-shadow-mask.svg'
import workVector from './assets/figma/work-vector.svg'

const wideFrame = { width: 1920, height: 1080 }
const laptopFrame = { width: 1440, height: 1080 }
const desktopFrame = { width: 1280, height: 1080 }
const tabletFrame = { width: 800, height: 1080 }
const mobileFrame = { width: 375, height: 1080 }
const workMobileFrame = { width: 375, height: 1076 }

// Generate frame paths for morphing sequences
function generateFramePaths(sequenceName, frameCount = 24) {
  const frames = []
  for (let i = 0; i < frameCount; i++) {
    const frameNum = i.toString().padStart(2, '0')
    frames.push(`/morphing/${sequenceName}/${sequenceName}${frameNum}.png`)
  }
  return frames
}

const workToPlaygroundFrames = generateFramePaths('1-2', 24)
const playgroundToAnalogueFrames = generateFramePaths('2-3', 17)
const analogueToWorkFrames = generateFramePaths('3-1', 24)

const desktopHeader = { top: 15, variant: 'desktop', width: 260 }
const tabletHeader = { top: 35, variant: 'desktop', width: 260 }
const analogueTabletHeader = { top: 15, variant: 'desktop', width: 260 }
const mobileHeader = { top: 35, variant: 'mobile', width: 266 }

const navButton = (id, width, showLabel = true) => ({
  id,
  showLabel,
  width,
})

const nav = (top, buttons, gap = 24) => ({
  buttons,
  gap,
  top,
})

const vector = (wrapperLeft, wrapperTop, wrapperWidth, wrapperHeight, width, height, transform, src) => ({
  height,
  src,
  transform,
  width,
  wrapperHeight,
  wrapperLeft,
  wrapperTop,
  wrapperWidth,
})

const art = (wrapperLeft, wrapperTop, wrapperWidth, wrapperHeight, width, height, transform, src) => ({
  height,
  src,
  transform,
  width,
  wrapperHeight,
  wrapperLeft,
  wrapperTop,
  wrapperWidth,
})

const shadow = (
  wrapperLeft,
  wrapperTop,
  wrapperWidth,
  wrapperHeight,
  width,
  height,
  transform,
  maskSrc,
  opacity,
  filter,
) => ({
  filter,
  height,
  maskSrc,
  opacity,
  transform,
  width,
  wrapperHeight,
  wrapperLeft,
  wrapperTop,
  wrapperWidth,
})

export const BREAKPOINTS = [
  { id: 'wide', minWidth: 1680 },
  { id: 'laptop', minWidth: 1360 },
  { id: 'desktop', minWidth: 1040 },
  { id: 'tablet', minWidth: 600 },
  { id: 'mobile', minWidth: 0 },
]

export function getBreakpointId(viewportWidth) {
  return BREAKPOINTS.find((breakpoint) => viewportWidth >= breakpoint.minWidth)?.id ?? 'desktop'
}

export const GRAIN_LAYER = {
  rotate: 0.6,
  scale: 1.42,
  skewX: -1.47,
  src: backgroundGrain,
}

export const STATES = [
  {
    activeBorder: '2px solid #ffd96d',
    activeFill: '#e8ab69',
    activeText: '#3f3929',
    gradientBottom: 'rgba(232, 199, 108, 0.7)',
    gradientStop: '22.115%',
    id: 'work',
    label: 'Latest Work',
    navLabel: 'LATEST WORK',
    layouts: {
      wide: {
        frame: wideFrame,
        header: desktopHeader,
        nav: nav(
          224,
          [navButton('analogue', 157), navButton('work', 368), navButton('playground', 197)],
        ),
        scene: {
          art: art(482.003, 460.419, 799.421, 771.775, 730.109, 699.03, 'rotate(6.02deg)', workArt),
          shadow: shadow(
            673.649,
            372.679,
            1327.33,
            899.374,
            1232.864,
            722.553,
            'rotate(-8.63deg) scaleY(-1)',
            workShadowMask,
            0.34,
          ),
          vector: vector(
            601.855,
            326.998,
            1087.678,
            1038.817,
            857.007,
            764.797,
            'rotate(157deg)',
            workVector,
          ),
        },
      },
      laptop: {
        frame: laptopFrame,
        header: desktopHeader,
        nav: nav(
          224,
          [navButton('analogue', 157), navButton('work', 368), navButton('playground', 197)],
        ),
        scene: {
          art: art(283.563, 412.623, 820.565, 792.187, 749.419, 717.519, 'rotate(6.02deg)', workArt),
          shadow: shadow(
            564.012,
            392.991,
            1278.267,
            866.13,
            1187.293,
            695.845,
            'rotate(-8.63deg) scaleY(-1)',
            workShadowMask,
            0.34,
          ),
          vector: vector(
            494.868,
            348.997,
            1047.474,
            1000.419,
            825.33,
            736.528,
            'rotate(157deg)',
            workVector,
          ),
        },
      },
      desktop: {
        frame: desktopFrame,
        header: desktopHeader,
        nav: nav(
          224,
          [navButton('analogue', 157), navButton('work', 368), navButton('playground', 197)],
        ),
        scene: {
          art: art(137, 441, 819.098, 790.772, 748.08, 716.237, 'rotate(6.02deg)', workArt),
          shadow: shadow(
            371.497,
            393.105,
            1173.945,
            795.443,
            1090.395,
            639.055,
            'rotate(-8.63deg) scaleY(-1)',
            workShadowMask,
            0.34,
          ),
          vector: vector(
            307.996,
            352.71,
            961.987,
            918.773,
            757.972,
            676.418,
            'rotate(157deg)',
            workVector,
          ),
        },
      },
      tablet: {
        frame: tabletFrame,
        header: tabletHeader,
        nav: nav(
          225,
          [navButton('analogue', 117), navButton('work', 368), navButton('playground', 157)],
        ),
        scene: {
          art: art(-158.128, 441, 819.098, 790.772, 748.08, 716.237, 'rotate(6.02deg)', workArt),
          shadow: shadow(
            76.368,
            393.105,
            1173.945,
            795.443,
            1090.395,
            639.055,
            'rotate(-8.63deg) scaleY(-1)',
            workShadowMask,
            0.34,
          ),
          vector: vector(
            12.877,
            352.71,
            961.987,
            918.773,
            757.972,
            676.418,
            'rotate(157deg)',
            workVector,
          ),
        },
      },
      mobile: {
        frame: workMobileFrame,
        header: mobileHeader,
        nav: nav(
          137,
          [navButton('analogue', 73.5, false), navButton('work', 180), navButton('playground', 73.5, false)],
          8,
        ),
        scene: {
          art: art(-421.063, 438.372, 819.098, 790.772, 748.08, 716.237, 'rotate(6.02deg)', workArt),
          shadow: shadow(
            -186.557,
            390.487,
            1173.945,
            795.443,
            1090.395,
            639.055,
            'rotate(-8.63deg) scaleY(-1)',
            workShadowMask,
            0.34,
          ),
          vector: vector(
            -250.058,
            350.092,
            961.987,
            918.773,
            757.972,
            676.418,
            'rotate(157deg)',
            workVector,
          ),
        },
      },
    },
  },
  {
    activeBorder: '1px solid rgba(255, 255, 255, 0.5)',
    activeFill: 'rgba(0, 179, 211, 0.43)',
    activeText: '#2d3d40',
    gradientBottom: 'rgba(78, 195, 216, 0.7)',
    gradientStop: '30.288%',
    id: 'playground',
    label: 'AI Playground',
    navLabel: 'AI PLAYGROUND',
    layouts: {
      wide: {
        frame: wideFrame,
        header: desktopHeader,
        nav: nav(
          224,
          [navButton('work', 174), navButton('playground', 368), navButton('analogue', 157)],
        ),
        scene: {
          art: art(356, 287.002, 990.589, 871.146, 611.028, 823.559, 'rotate(68.42deg)', playgroundArt),
          shadow: shadow(
            1251.999,
            215.998,
            1266.776,
            1291.896,
            1092.575,
            727.841,
            'rotate(50.72deg)',
            playgroundShadowMask,
            0.18,
            'saturate(0.2) brightness(1.05)',
          ),
          vector: vector(
            876.301,
            225.003,
            939.056,
            995.571,
            788.284,
            676.493,
            'rotate(-114.05deg)',
            playgroundVector,
          ),
        },
      },
      laptop: {
        frame: laptopFrame,
        header: desktopHeader,
        nav: nav(
          224,
          [navButton('work', 174), navButton('playground', 368), navButton('analogue', 157)],
        ),
        scene: {
          art: art(115.37, 297.635, 957.18, 860.793, 581.534, 783.807, 'rotate(64.69deg)', playgroundArt),
          shadow: shadow(
            771.999,
            215.998,
            1266.776,
            1291.896,
            1092.575,
            727.841,
            'rotate(50.72deg)',
            playgroundShadowMask,
            0.18,
            'saturate(0.2) brightness(1.05)',
          ),
          vector: vector(
            594.004,
            295.005,
            704.51,
            746.909,
            591.395,
            507.526,
            'rotate(-114.05deg)',
            playgroundVector,
          ),
        },
      },
      desktop: {
        frame: desktopFrame,
        header: desktopHeader,
        nav: nav(
          224,
          [navButton('work', 174), navButton('playground', 368), navButton('analogue', 157)],
        ),
        scene: {
          art: art(74, 333.005, 924.839, 813.323, 570.471, 768.895, 'rotate(68.42deg)', playgroundArt),
          shadow: shadow(
            611.999,
            215.998,
            1266.776,
            1291.896,
            1092.575,
            727.841,
            'rotate(50.72deg)',
            playgroundShadowMask,
            0.18,
            'saturate(0.2) brightness(1.05)',
          ),
          vector: vector(
            514.004,
            295.005,
            704.51,
            746.909,
            591.395,
            507.526,
            'rotate(-114.05deg)',
            playgroundVector,
          ),
        },
      },
      tablet: {
        frame: tabletFrame,
        header: tabletHeader,
        nav: nav(
          225,
          [navButton('work', 174), navButton('playground', 368), navButton('analogue', 157)],
        ),
        scene: {
          art: art(-82.71, 314.49, 948.177, 860.668, 573.09, 772.425, 'rotate(63.08deg)', playgroundArt),
          shadow: shadow(
            81.999,
            215.998,
            1266.776,
            1291.896,
            1092.575,
            727.841,
            'rotate(50.72deg)',
            playgroundShadowMask,
            0.18,
            'saturate(0.2) brightness(1.05)',
          ),
          vector: vector(
            376.998,
            281.996,
            760.063,
            805.806,
            638.03,
            547.547,
            'rotate(-114.05deg)',
            playgroundVector,
          ),
        },
      },
      mobile: {
        frame: mobileFrame,
        header: mobileHeader,
        nav: nav(
          147,
          [navButton('work', 73.5, false), navButton('playground', 180), navButton('analogue', 73.5, false)],
          8,
        ),
        scene: {
          art: art(-21, 526.998, 417.281, 561.22, 415.3, 559.753, 'rotate(0.2deg)', playgroundArt),
          shadow: shadow(
            -343.001,
            215.995,
            1266.776,
            1291.896,
            1092.575,
            727.841,
            'rotate(50.72deg)',
            playgroundShadowMask,
            0.18,
            'saturate(0.2) brightness(1.05)',
          ),
          vector: vector(
            107.998,
            221.996,
            760.063,
            805.806,
            638.03,
            547.547,
            'rotate(-114.05deg)',
            playgroundVector,
          ),
        },
      },
    },
  },
  {
    activeBorder: '1px solid rgba(255, 255, 255, 0.5)',
    activeFill: 'rgba(96, 123, 47, 0.43)',
    activeText: '#2d3d40',
    gradientBottom: 'rgba(96, 123, 47, 0.7)',
    gradientStop: '30.288%',
    id: 'analogue',
    label: 'Analog',
    navLabel: 'ANALOG',
    layouts: {
      wide: {
        frame: wideFrame,
        header: desktopHeader,
        nav: nav(
          224,
          [navButton('playground', 197), navButton('analogue', 368), navButton('work', 174)],
        ),
        scene: {
          art: art(613, 322, 988.03, 1003.93, 796.534, 819.47, 'rotate(164.35deg) scaleY(-1)', analogueArt),
          shadow: shadow(
            218.12,
            115.39,
            1648.313,
            1782.939,
            1504.355,
            959.86,
            'rotate(55.07deg)',
            analogueShadowMask,
            0.32,
          ),
          vector: vector(
            536,
            565,
            921.78,
            908.177,
            756.502,
            774.499,
            'rotate(-102.69deg)',
            analogueVector,
          ),
        },
      },
      laptop: {
        frame: laptopFrame,
        header: desktopHeader,
        nav: nav(
          224,
          [navButton('playground', 197), navButton('analogue', 368), navButton('work', 174)],
        ),
        scene: {
          art: art(358.98, 340, 790.785, 803.511, 637.518, 655.875, 'rotate(164.35deg) scaleY(-1)', analogueArt),
          shadow: shadow(
            187.08,
            350.38,
            1171.489,
            1267.171,
            1069.175,
            682.192,
            'rotate(55.07deg)',
            analogueShadowMask,
            0.32,
          ),
          vector: vector(
            406,
            501,
            766.364,
            755.054,
            628.952,
            643.914,
            'rotate(-102.69deg)',
            analogueVector,
          ),
        },
      },
      desktop: {
        frame: desktopFrame,
        header: desktopHeader,
        nav: nav(
          224,
          [navButton('playground', 197), navButton('analogue', 368), navButton('work', 174)],
        ),
        scene: {
          art: art(359, 340, 790.785, 803.511, 637.518, 655.875, 'rotate(164.35deg) scaleY(-1)', analogueArt),
          shadow: shadow(
            187.12,
            350.38,
            1171.489,
            1267.171,
            1069.175,
            682.192,
            'rotate(55.07deg)',
            analogueShadowMask,
            0.32,
          ),
          vector: vector(
            406,
            501,
            766.364,
            755.054,
            628.952,
            643.914,
            'rotate(-102.69deg)',
            analogueVector,
          ),
        },
      },
      tablet: {
        frame: tabletFrame,
        header: analogueTabletHeader,
        nav: nav(
          205,
          [navButton('playground', 197), navButton('analogue', 368), navButton('work', 174)],
        ),
        scene: {
          art: art(186, 351, 790.785, 803.511, 637.518, 655.875, 'rotate(164.35deg) scaleY(-1)', analogueArt),
          shadow: shadow(
            -41.33,
            222.85,
            1171.489,
            1267.171,
            1069.175,
            682.192,
            'rotate(55.07deg)',
            analogueShadowMask,
            0.32,
          ),
          vector: vector(
            198,
            435,
            766.364,
            755.054,
            628.952,
            643.914,
            'rotate(-102.69deg)',
            analogueVector,
          ),
        },
      },
      mobile: {
        frame: mobileFrame,
        header: mobileHeader,
        nav: nav(
          189,
          [navButton('playground', 73.5, false), navButton('analogue', 180), navButton('work', 73.5, false)],
          8,
        ),
        scene: {
          art: art(1, 663, 497.227, 505.229, 400.856, 412.399, 'rotate(164.35deg) scaleY(-1)', analogueArt),
          shadow: shadow(
            -110.94,
            502.83,
            839.856,
            908.452,
            766.506,
            489.073,
            'rotate(55.07deg)',
            analogueShadowMask,
            0.32,
          ),
          vector: vector(
            51.03,
            626.81,
            549.417,
            541.309,
            450.904,
            461.631,
            'rotate(-102.69deg)',
            analogueVector,
          ),
        },
      },
    },
  },
]

export const STATE_BY_ID = Object.fromEntries(STATES.map((state) => [state.id, state]))

export const TRANSITION_IMAGES = [
  {
    from: 'work',
    frames: workToPlaygroundFrames,
    to: 'playground',
  },
  {
    from: 'playground',
    frames: playgroundToAnalogueFrames,
    to: 'analogue',
  },
  {
    from: 'analogue',
    frames: analogueToWorkFrames,
    to: 'work',
  },
]
