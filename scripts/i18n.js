// Translation tooling. Usage:
//   node scripts/i18n.js tag     Tag untagged texts in index.html with data-i18n keys, refresh locales/en.json
//                                and add the new keys (empty value = untranslated) to locales/fr.json
//   node scripts/i18n.js check   Report untagged texts, untranslated keys and orphan keys (exit 1 on errors)
//   node scripts/i18n.js check --strict   Also fail when some keys are still untranslated
//
// Conventions (see README "Translations"):
//   data-i18n="key"                     replaces the element content with locales/<lang>.json[key] (HTML allowed)
//   data-i18n-attr="alt:key;title:key"  replaces attributes
//   data-i18n-skip                      excludes an element and its subtree (text filled by JS, dead code...)
//   I18n.t('key', 'English text')       strings built in JS, collected from js/ and components/
const fs = require('fs')
const path = require('path')
const parse5 = require('parse5')

const ROOT = path.join(__dirname, '..')
const HTML_FILE = path.join(ROOT, 'index.html')
const LOCALES_DIR = path.join(ROOT, 'locales')
const EN_FILE = path.join(LOCALES_DIR, 'en.json')
const FR_FILE = path.join(LOCALES_DIR, 'fr.json')
const JS_DIRS = ['js', 'components']

// Elements that may sit inside a sentence
const PHRASING = new Set(['a', 'abbr', 'b', 'bdi', 'br', 'code', 'em', 'i', 'mark', 'small', 'span', 'strong', 'sub', 'sup', 'u', 's', 'img', 'label', 'time', 'button', 'wbr', 'q', 'cite'])
// Elements ignored entirely (opaque, or replaced at runtime)
const OPAQUE = new Set(['script', 'style', 'svg', 'iframe', 'textarea', 'geom', 'inline-svg-logo', 'coming-soon'])
const VOID = new Set(['br', 'img', 'wbr', 'hr', 'input'])
const ATTRS = ['title', 'alt', 'placeholder', 'aria-label']
const LETTERS = /\p{L}/u
const NBSP = String.fromCharCode(160)
const LINE_FEED_MASK = String.fromCharCode(0xE000).repeat(5)

const children = (node) => node.tagName === 'template' ? node.content.childNodes : (node.childNodes || [])
const attr = (node, name) => (node.attrs || []).find(a => a.name === name)?.value

function isTranslatableAttr(node, name) {
    const value = attr(node, name)
    if (!value || !LETTERS.test(value)) return false
    // Logos and project names repeat the same proper noun in several attributes: leave them alone
    const same = ATTRS.filter(a => attr(node, a) === value)
    if (same.length > 1) return false
    return true
}

function ownAttrUnits(node) {
    const units = []
    if (node.tagName === 'vue-title') {
        const value = attr(node, 'title')
        if (value) units.push({ kind: 'attr', node, name: 'title', value })
        return units
    }
    if (node.tagName === 'meta' && ['description', 'keywords'].includes(attr(node, 'name'))) {
        units.push({ kind: 'attr', node, name: 'content', value: attr(node, 'content') })
    }
    ATTRS.forEach(name => {
        if (isTranslatableAttr(node, name)) units.push({ kind: 'attr', node, name, value: attr(node, name) })
    })
    return units
}

// Dictionary string of a unit: inline elements lose their attributes, the runtime re-attaches the originals.
// `n` disambiguates several same-tag siblings that carry attributes.
function hasAttrsDeep(node) {
    return (node.attrs || []).length > 0 || children(node).some(c => c.tagName && hasAttrsDeep(c))
}
function serialize(node) {
    const kids = children(node).filter(k => !(k.tagName && OPAQUE.has(k.tagName)))
    const counts = {}
    kids.forEach(k => { if (k.tagName) counts[k.tagName] = (counts[k.tagName] || 0) + 1 })
    const seen = {}
    let out = ''
    for (const k of kids) {
        if (k.nodeName === '#text') {
            out += k.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').split(NBSP).join('&nbsp;').split(LINE_FEED_MASK).join('&#10;')
        } else if (k.tagName) {
            const index = seen[k.tagName] = (seen[k.tagName] ?? -1) + 1
            const n = counts[k.tagName] > 1 && hasAttrsDeep(k) ? ` n="${index}"` : ''
            out += VOID.has(k.tagName) ? `<${k.tagName}${n}>` : `<${k.tagName}${n}>${serialize(k)}</${k.tagName}>`
        }
    }
    return out.replace(/\s+/g, ' ').trim()
}

// Key prefix of the part of the page an element belongs to
function scopeFor(node, inherited) {
    if (node.tagName === 'template') return (attr(node, 'id') || 'template').replace(/-template$/, '')
    if (node.tagName === 'head') return 'meta'
    const classes = (attr(node, 'class') || '').split(/\s+/)
    if (classes.includes('header')) return 'nav'
    if (classes.includes('footer')) return 'footer'
    return inherited
}

const parseAttrKeys = (node) => Object.fromEntries((attr(node, 'data-i18n-attr') || '').split(';').filter(Boolean).map(p => p.split(':')))

function collect(node, units, problems, scope = 'ui') {
    for (const child of children(node)) {
        if (!child.tagName) continue
        if (OPAQUE.has(child.tagName) || attr(child, 'data-i18n-skip') !== undefined) continue
        const childScope = scopeFor(child, scope)
        const push = (u) => units.push({ ...u, scope: childScope })

        const attrKeys = parseAttrKeys(child)
        ownAttrUnits(child).forEach(u => push({ ...u, key: attrKeys[u.name] }))

        const kids = children(child)
        const existingKey = attr(child, 'data-i18n')
        if (existingKey) {
            push({ kind: 'text', node: child, value: serialize(child), key: existingKey })
            collectInlineAttrs(child, push)
            continue
        }
        const hasDirectText = kids.some(k => k.nodeName === '#text' && LETTERS.test(k.value))
        const hasBlock = kids.some(k => k.tagName && !PHRASING.has(k.tagName) && !OPAQUE.has(k.tagName))
        if (!hasDirectText) {
            collect(child, units, problems, childScope)
        } else if (!hasBlock) {
            push({ kind: 'text', node: child, value: serialize(child) })
            collectInlineAttrs(child, push)
        } else {
            problems.push(`Loose text next to block elements in <${child.tagName}>: ${kids.filter(k => k.nodeName === '#text').map(k => k.value.trim()).join(' ').slice(0, 80)}`)
            collect(child, units, problems, childScope)
        }
    }
}

function collectInlineAttrs(node, push) {
    for (const child of children(node)) {
        if (!child.tagName) continue
        const attrKeys = parseAttrKeys(child)
        ownAttrUnits(child).forEach(u => push({ ...u, key: attrKeys[u.name] }))
        collectInlineAttrs(child, push)
    }
}

function slugify(text) {
    const plain = text.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ')
        .normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    const words = plain.split(/[^a-z0-9]+/).filter(Boolean)
    let slug = ''
    for (const w of words) {
        if ((slug + '-' + w).length > 38 && slug) break
        slug = slug ? slug + '-' + w : w
    }
    return slug || 'text'
}

function readJson(file, fallback) {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback
}

function writeJson(file, obj) {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    const lines = Object.entries(obj).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
    fs.writeFileSync(file, '{\n' + lines.join(',\n') + '\n}\n')
}

// Strings written directly in JS: I18n.t('key', 'English text', ...)
function collectJsStrings() {
    const found = {}
    const re = /I18n\.t\(\s*(['"])([^'"]+)\1\s*,\s*(?:(['"`])((?:\\.|(?!\3)[^\\])*)\3)/g
    JS_DIRS.forEach(dir => {
        const full = path.join(ROOT, dir)
        fs.readdirSync(full).filter(f => f.endsWith('.js')).forEach(f => {
            const src = fs.readFileSync(path.join(full, f), 'utf8')
            let m
            while ((m = re.exec(src))) found[m[2]] = m[4].replace(/\\(['"`\\])/g, '$1')
        })
    })
    return found
}

function analyse() {
    const src = fs.readFileSync(HTML_FILE, 'utf8')
    // &#10; (explicit line feed) must survive whitespace collapsing: mask it with a same-length placeholder so offsets stay valid
    const doc = parse5.parse(src.split('&#10;').join(LINE_FEED_MASK), { sourceCodeLocationInfo: true })
    const html = doc.childNodes.find(n => n.tagName === 'html')
    const units = [], problems = []
    html.childNodes.filter(n => n.tagName === 'head' || n.tagName === 'body').forEach(section => {
        collect(section, units, problems, section.tagName === 'head' ? 'meta' : 'ui')
    })
    return { src, units, problems }
}

function tag() {
    const { src, units, problems } = analyse()
    const en = readJson(EN_FILE, {})
    const fr = readJson(FR_FILE, {})

    // Reverse index so identical strings share one key
    const keyByValue = {}
    Object.entries(en).forEach(([k, v]) => { keyByValue[v] = keyByValue[v] || k })
    const used = new Set(Object.keys(en))
    units.filter(u => u.key).forEach(u => used.add(u.key))

    // Strings that appear several times become common.*
    const occurrences = {}
    units.forEach(u => { occurrences[u.value] = (occurrences[u.value] || 0) + 1 })

    const edits = []
    const newEn = {}
    const ensureKey = (u) => {
        if (u.key) return u.key
        let key = keyByValue[u.value]
        if (!key) {
            const scope = occurrences[u.value] > 1 ? 'common' : u.scope
            const base = scope + '.' + slugify(u.value)
            key = base
            for (let i = 2; used.has(key); i++) key = base + '-' + i
            used.add(key)
            keyByValue[u.value] = key
        }
        return key
    }

    // Group attribute units per element so one data-i18n-attr carries all of them
    const attrEdits = new Map()
    units.forEach(u => {
        const key = ensureKey(u)
        u.key = key
        newEn[key] = u.value
        const loc = u.node.sourceCodeLocation.startTag
        if (u.kind === 'text') {
            if (!attr(u.node, 'data-i18n')) edits.push({ at: loc.startOffset + 1 + u.node.tagName.length, text: ` data-i18n="${key}"` })
        } else if (!(attr(u.node, 'data-i18n-attr') || '').split(';').some(p => p.startsWith(u.name + ':'))) {
            const entry = attrEdits.get(u.node) || { node: u.node, pairs: [] }
            entry.pairs.push(`${u.name}:${key}`)
            attrEdits.set(u.node, entry)
        }
    })
    attrEdits.forEach(({ node, pairs }) => {
        const loc = node.sourceCodeLocation.startTag
        const current = (node.attrs || []).find(a => a.name === 'data-i18n-attr')
        if (current) {
            // Extend existing attribute value
            const attrLoc = node.sourceCodeLocation.attrs['data-i18n-attr']
            edits.push({ at: attrLoc.endOffset - 1, text: ';' + pairs.join(';') })
        } else {
            edits.push({ at: loc.startOffset + 1 + node.tagName.length, text: ` data-i18n-attr="${pairs.join(';')}"` })
        }
    })

    let out = src
    edits.sort((a, b) => b.at - a.at).forEach(e => { out = out.slice(0, e.at) + e.text + out.slice(e.at) })
    if (out !== src) fs.writeFileSync(HTML_FILE, out)

    // JS strings
    const jsStrings = collectJsStrings()
    Object.assign(newEn, jsStrings)

    writeJson(EN_FILE, newEn)
    const newFr = {}
    Object.keys(newEn).forEach(k => { newFr[k] = fr[k] ?? '' })
    // Keep orphan translations visible rather than silently dropping hand-made work
    Object.keys(fr).filter(k => !(k in newEn)).forEach(k => { newFr[k] = fr[k] })
    writeJson(FR_FILE, newFr)

    problems.forEach(p => console.warn('Warning:', p))
    console.log(`${edits.length} attribute insertions, ${Object.keys(newEn).length} keys in en.json, ${Object.values(newFr).filter(v => v === '').length} untranslated in fr.json`)
}

function check() {
    const strict = process.argv.includes('--strict')
    const { units, problems } = analyse()
    const en = readJson(EN_FILE, {})
    const fr = readJson(FR_FILE, {})
    const jsStrings = collectJsStrings()
    let errors = 0
    const fail = (msg) => { errors++; console.error('ERROR  ' + msg) }

    problems.forEach(p => fail(p))
    units.filter(u => !u.key).forEach(u => fail(`Untagged ${u.kind === 'attr' ? u.name + ' attribute' : 'text'}: ${u.value.slice(0, 70)} (run "node scripts/i18n.js tag")`))

    const current = {}
    units.filter(u => u.key).forEach(u => { current[u.key] = u.value })
    Object.assign(current, jsStrings)
    Object.entries(current).forEach(([k, v]) => {
        if (!(k in en)) fail(`Key missing from en.json: ${k}`)
        else if (en[k] !== v) fail(`en.json is stale for ${k} (run "node scripts/i18n.js tag")`)
    })
    Object.keys(en).filter(k => !(k in current)).forEach(k => console.warn(`WARN   en.json key no longer used: ${k}`))
    Object.keys(fr).filter(k => !(k in current)).forEach(k => console.warn(`WARN   fr.json key no longer used: ${k}`))

    const untranslated = Object.keys(current).filter(k => !fr[k])
    untranslated.forEach(k => (strict ? fail : (m) => console.warn('WARN   ' + m))(`Untranslated: ${k}  ->  ${String(current[k]).slice(0, 60)}`))

    // Dictionary strings must keep the structure (tags) of the English source
    Object.entries(current).forEach(([k, v]) => {
        if (!fr[k]) return
        const tags = (s) => (s.match(/<\/?[a-z]+[^>]*>/gi) || []).map(t => t.replace(/\s.*>/, '>').toLowerCase()).sort().join('')
        const frTags = tags(fr[k]), enTags = tags(v)
        // <sup> and <em> are allowed to differ, other tags must be kept (they carry links, icons, JS hooks)
        const strip = (s) => s.replace(/<\/?(sup|em|strong|br)>/g, '')
        if (strip(frTags) !== strip(enTags)) console.warn(`WARN   tags differ between en and fr for ${k}`)
    })

    console.log(`${Object.keys(current).length} keys, ${untranslated.length} untranslated, ${errors} error(s)`)
    process.exit(errors ? 1 : 0)
}

const command = process.argv[2]
if (command === 'tag') tag()
else if (command === 'check') check()
else console.log('Usage: node scripts/i18n.js tag|check [--strict]')
