// Liquid glass — real refraction for every glass surface, not just a blur.
//
// Each surface is modelled as a slab of glass with a rounded bevel. For every
// pixel a vertical light ray enters the curved surface, bends by Snell's law,
// and travels through the glass to the backdrop plane; how far it landed
// sideways becomes one pixel of a displacement map. Small surfaces also get a
// separate pass per colour channel, each bending slightly differently, for the
// faint rainbow fringe of real glass (dispersion).
//
// Any CSS rule using `backdrop-filter: var(--lg-filter, ...)` opts in: the rules
// are found by reading the stylesheet, and each matching element gets a filter
// built for its exact size and corner radius.
//
// backdrop-filter: url() only renders in Chromium. Other browsers, low-spec
// machines and reduced-transparency users never get --lg-filter, so the CSS
// falls back to the site's standard --frost recipe.

// Optical settings, overridable per surface with --lg-* custom properties.
const OPTICS = {
  ior: ['--lg-ior', 1.5],
  bezel: ['--lg-bezel', 0.55], // curved edge width, relative to the corner radius
  thickness: ['--lg-thickness', 1.45], // glass height, relative to the bezel
  dispersion: ['--lg-dispersion', 0.05], // how much more blue bends than red
  saturate: ['--lg-saturate', 1.3],
}
const BEZEL_MIN = 6
const BEZEL_MAX = 28
const SMALL_AREA = 300000 // px², below this a surface can afford dispersion (this page has few, so the message qualifies)
const HALF_RES_AREA = 200000 // px², above this the map is built at half size
const RESIZE_SETTLE_MS = 140 // wait out animations like the dock swell
const MAX_FILTERS = 80

const SVG_NS = 'http://www.w3.org/2000/svg'
const CHANNELS = {
  r: '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
  g: '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0',
  b: '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0',
}

const filters = new Map() // "w x h x r" -> url(#id), shared between same-size surfaces
let defs = null

// Squircle bevel: 0 at the outer edge, 1 where the surface goes flat.
const bevel = (t) => (1 - (1 - t) ** 4) ** 0.25

// Sideways travel of a ray hitting the bevel at `t` (0 edge, 1 flat). Negative:
// the ray bends inward, toward the surface's centre.
function refractedOffset(t, bezel, thickness, ior) {
  const eps = 0.005
  const slope = (thickness * (bevel(t + eps) - bevel(t - eps))) / (2 * eps * bezel)
  const len = Math.hypot(slope, 1)
  const cosI = 1 / len
  const eta = 1 / ior
  const k = 1 - eta * eta * (1 - cosI * cosI)
  const bend = eta * cosI - Math.sqrt(k)
  const rayOut = (bend * slope) / len
  const rayDown = eta - bend / len
  return (rayOut / rayDown) * thickness * bevel(t)
}

function buildMap(w, h, radius, optics) {
  const res = w * h > HALF_RES_AREA ? 0.5 : 1
  const mw = Math.round(w * res)
  const mh = Math.round(h * res)
  const bezel = Math.min(Math.max(radius * optics.bezel, BEZEL_MIN), BEZEL_MAX)
  const thickness = bezel * optics.thickness

  const table = new Float32Array(65)
  let max = 0
  for (let i = 0; i < 64; i++) {
    table[i] = refractedOffset(Math.max(i / 64, 0.02), bezel, thickness, optics.ior)
    max = Math.max(max, Math.abs(table[i]))
  }
  max = max || 1

  const canvas = document.createElement('canvas')
  canvas.width = mw
  canvas.height = mh
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(mw, mh)
  const hw = w / 2
  const hh = h / 2

  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const o = (y * mw + x) * 4
      img.data[o] = img.data[o + 1] = img.data[o + 2] = 128
      img.data[o + 3] = 255
      // Signed distance to the rounded rectangle, plus its outward direction.
      const px = (x + 0.5) / res - hw
      const py = (y + 0.5) / res - hh
      const qx = Math.abs(px) - (hw - radius)
      const qy = Math.abs(py) - (hh - radius)
      const corner = Math.hypot(Math.max(qx, 0), Math.max(qy, 0))
      const dist = radius - corner - Math.min(Math.max(qx, qy), 0)
      if (dist <= 0 || dist >= bezel) continue
      let nx = 0
      let ny = 0
      if (corner > 0) {
        nx = (Math.max(qx, 0) / corner) * Math.sign(px)
        ny = (Math.max(qy, 0) / corner) * Math.sign(py)
      } else if (qx > qy) {
        nx = Math.sign(px)
      } else {
        ny = Math.sign(py)
      }
      const offset = table[Math.floor((dist / bezel) * 64)] / max
      img.data[o] = 128 + nx * offset * 127
      img.data[o + 1] = 128 + ny * offset * 127
    }
  }
  ctx.putImageData(img, 0, 0)
  return { canvas, scale: max * 2 }
}

const channelPass = (channel, factor, scale) => `
  <feDisplacementMap in="soft" in2="map" scale="${(scale * factor).toFixed(2)}" xChannelSelector="R" yChannelSelector="G" result="d${channel}" />
  <feColorMatrix in="d${channel}" type="matrix" values="${CHANNELS[channel]} 0 0 0 1 0" result="${channel}" />`

function filterMarkup(w, h, optics, { href, scale }) {
  const refract =
    w * h < SMALL_AREA && optics.dispersion > 0
      ? `${channelPass('r', 1 - optics.dispersion * 0.8, scale)}
         ${channelPass('g', 1, scale)}
         ${channelPass('b', 1 + optics.dispersion, scale)}
         <feBlend in="r" in2="g" mode="screen" result="rg" />
         <feBlend in="rg" in2="b" mode="screen" result="out" />`
      : `<feDisplacementMap in="soft" in2="map" scale="${scale.toFixed(2)}" xChannelSelector="R" yChannelSelector="G" result="out" />`
  return `
    <feGaussianBlur in="SourceGraphic" stdDeviation="${optics.blur}" result="soft" />
    <feImage href="${href}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map" />
    ${refract}
    <feColorMatrix in="out" type="saturate" values="${optics.saturate}" />`
}

function createFilter(id, w, h, optics, map) {
  if (!defs) {
    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.style.position = 'absolute'
    defs = document.createElementNS(SVG_NS, 'defs')
    svg.appendChild(defs)
    document.body.appendChild(svg)
  }

  const filter = document.createElementNS(SVG_NS, 'filter')
  filter.id = id
  filter.setAttribute('filterUnits', 'userSpaceOnUse')
  filter.setAttribute('primitiveUnits', 'userSpaceOnUse')
  filter.setAttribute('x', '0')
  filter.setAttribute('y', '0')
  filter.setAttribute('width', w)
  filter.setAttribute('height', h)
  filter.setAttribute('color-interpolation-filters', 'sRGB')
  filter.innerHTML = filterMarkup(w, h, optics, map)
  defs.appendChild(filter)
  return `url(#${id})`
}

function filterFor(w, h, radius, optics) {
  const key = [w, h, radius, ...Object.values(optics)].join('x').replace(/\./g, '_')
  if (filters.has(key)) return filters.get(key)

  const { canvas, scale } = buildMap(w, h, radius, optics)
  const value = createFilter(`liquid-glass-${key}`, w, h, optics, { href: canvas.toDataURL('image/png'), scale })
  filters.set(key, value)
  return value
}

// Every selector in the stylesheet that opts in via var(--lg-filter, ...).
function glassSelector() {
  const found = []
  const walk = (rules) => {
    for (const rule of rules) {
      if (rule.cssRules && !rule.selectorText) walk(rule.cssRules)
      else if (rule.selectorText && rule.cssText.includes('--lg-filter,')) found.push(rule.selectorText)
    }
  }
  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules)
    } catch {
      /* cross-origin sheet */
    }
  }
  return found.join(', ')
}

function radiusOf(style, w, h) {
  const raw = style.borderTopLeftRadius
  const value = parseFloat(raw) || 0
  const px = raw.endsWith('%') ? (value / 100) * Math.min(w, h) : value
  return Math.round(Math.min(px, w / 2, h / 2))
}

// A little frost scales with size: tags stay crystal clear, while panels that
// hold paragraphs of text keep them readable over the moving background. A rule
// can override it with --lg-blur (the dock floats over everything, so it does).
function blurOf(style, w, h) {
  const custom = parseFloat(style.getPropertyValue('--lg-blur'))
  if (!Number.isNaN(custom)) return custom
  return h < 80 ? 0.5 : w * h < SMALL_AREA ? 1.5 : 3
}

function opticsOf(style, w, h) {
  const optics = { blur: blurOf(style, w, h) }
  for (const [name, [prop, fallback]] of Object.entries(OPTICS)) {
    const value = parseFloat(style.getPropertyValue(prop))
    optics[name] = Number.isNaN(value) ? fallback : value
  }
  return optics
}

export function initLiquidGlass() {
  if (
    !/Chrome\/|Chromium\//.test(navigator.userAgent) ||
    (navigator.hardwareConcurrency || 8) <= 4 ||
    window.matchMedia('(prefers-reduced-transparency: reduce)').matches
  )
    return

  const selector = glassSelector()
  if (!selector) return
  document.documentElement.classList.add('liquid-glass')

  const tracked = new Set()
  const pending = new Set()
  let settleTimer = null

  const apply = (el) => {
    const w = el.offsetWidth
    const h = el.offsetHeight
    if (!w || !h) return
    const style = getComputedStyle(el)
    const filter = filterFor(w, h, radiusOf(style, w, h), opticsOf(style, w, h))
    el.style.setProperty('--lg-filter', filter)
  }
  // Drop filters nothing uses any more (sizes left behind by window resizes).
  const sweep = () => {
    if (filters.size <= MAX_FILTERS) return
    const inUse = new Set([...tracked].map((el) => el.style.getPropertyValue('--lg-filter')))
    for (const [key, value] of filters) {
      if (inUse.has(value)) continue
      defs.querySelector(value.slice(4, -1))?.remove()
      filters.delete(key)
    }
  }

  // A surface's first map is built right away so it never flashes frost. Later
  // size changes wait to settle, so an animation doesn't rebuild every frame.
  const ro = new ResizeObserver((entries) => {
    for (const { target } of entries) {
      if (target.style.getPropertyValue('--lg-filter')) pending.add(target)
      else apply(target)
    }
    if (!pending.size) return
    clearTimeout(settleTimer)
    settleTimer = setTimeout(() => {
      pending.forEach((el) => el.isConnected && apply(el))
      pending.clear()
      sweep()
    }, RESIZE_SETTLE_MS)
  })

  const scan = () => {
    for (const el of tracked) {
      if (!el.isConnected) {
        ro.unobserve(el)
        tracked.delete(el)
      }
    }
    for (const el of document.querySelectorAll(selector)) {
      // Glass nested inside a backdrop-filtered parent only sees that parent, so
      // there's nothing to refract; it keeps the plain frost fallback.
      const host = el.parentElement.closest(selector)
      if (!tracked.has(el) && (!host || getComputedStyle(host).backdropFilter === 'none')) {
        tracked.add(el)
        ro.observe(el)
      }
    }
  }

  let queued = false
  new MutationObserver(() => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      queued = false
      scan()
    })
  }).observe(document.body, { childList: true, subtree: true })
  scan()
}
