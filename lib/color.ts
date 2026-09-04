// Color science helpers for the photo eyedropper feature.
//
// Why Lab space + Delta-E instead of naive RGB distance?
// RGB is not perceptually uniform - e.g. equal RGB distances in dark tones
// look far more different to the human eye than the same distance in light
// tones, and it has no notion of "how different does this actually look".
// CIE Lab was designed so that Euclidean distance between two Lab points
// (a.k.a. Delta-E) roughly tracks *perceived* color difference, regardless
// of hue/lightness. That makes "nearest centroid in Lab space" a principled
// way to answer "which category bucket does this exact color belong to?" -
// each COLORS entry's `hex` acts as that category's centroid, and every
// possible color implicitly belongs to whichever centroid it's perceptually
// closest to (a Voronoi partition of color space, rather than a hand-rolled
// set of RGB/HSL range thresholds that breaks down for grays/neutrals).
import { COLORS, type SolidColor } from '@/types'

export type RGB = [r: number, g: number, b: number]
export type Lab = [l: number, a: number, b: number]

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  const value = parseInt(full, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function srgbChannelToLinear(c: number): number {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

// sRGB (D65) -> CIE XYZ
function rgbToXyz([r, g, b]: RGB): [number, number, number] {
  const R = srgbChannelToLinear(r)
  const G = srgbChannelToLinear(g)
  const B = srgbChannelToLinear(b)

  return [
    (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) * 100,
    (R * 0.2126729 + G * 0.7151522 + B * 0.0721750) * 100,
    (R * 0.0193339 + G * 0.1191920 + B * 0.9503041) * 100,
  ]
}

// CIE XYZ -> CIE Lab, using the D65 reference white point
const D65 = { x: 95.047, y: 100.0, z: 108.883 }

function xyzToLab([x, y, z]: [number, number, number]): Lab {
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(x / D65.x)
  const fy = f(y / D65.y)
  const fz = f(z / D65.z)

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

export function hexToLab(hex: string): Lab {
  return xyzToLab(rgbToXyz(hexToRgb(hex)))
}

// CIE76 Delta-E: plain Euclidean distance in Lab space. Simple and good
// enough for bucketing into a coarse palette (differences below ~2.3 are
// considered "just noticeable" - we only care about much coarser groupings).
export function deltaE76(a: Lab, b: Lab): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)
}

const CATEGORY_LABS: Array<{ value: SolidColor; lab: Lab }> = COLORS
  .filter((c): c is (typeof COLORS)[number] & { value: SolidColor } => c.value !== 'multi')
  .map((c) => ({ value: c.value, lab: hexToLab(c.hex) }))

/**
 * Classifies an exact hex color into the nearest COLORS category, so
 * analytics can aggregate "5 kinds of burgundy" under one bucket while the
 * item still keeps its exact sampled hex for display.
 */
export function findNearestColorCategory(hex: string): SolidColor {
  const target = hexToLab(hex)

  let best: SolidColor = CATEGORY_LABS[0].value
  let bestDistance = Infinity

  for (const { value, lab } of CATEGORY_LABS) {
    const distance = deltaE76(lab, target)
    if (distance < bestDistance) {
      bestDistance = distance
      best = value
    }
  }

  return best
}
