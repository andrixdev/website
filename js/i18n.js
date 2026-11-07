// Internationalisation: locale detection, dictionary loading and DOM translation.
// Loaded synchronously from <head> so that the language is known (and the browser redirected) before anything renders.
//
// English is the source language and lives in the HTML itself. Other languages are flat dictionaries in
// /locales/<lang>.json, applied on top of the markup through attributes:
//   data-i18n="key"                      replaces the content of the element (HTML allowed)
//   data-i18n-attr="alt:key;title:key"   replaces attributes
// Switching language is a plain navigation to /<lang>/... (or / for English), so no state has to be restored.
const I18n = (() => {
    const DEFAULT_LOCALE = 'en'
    const LOCALES = ['en', 'fr']
    const STORAGE_KEY = 'alexandrix.lang'
    const PENDING_CLASS = 'i18n-pending'
    const ELEMENTS_TO_KEEP = ['geom', 'inline-svg-logo', 'coming-soon']

    const storage = {
        get: () => { try { return localStorage.getItem(STORAGE_KEY) } catch (e) { return null } },
        set: (value) => { try { localStorage.setItem(STORAGE_KEY, value) } catch (e) { } }
    }

    const nonDefaultLocales = LOCALES.filter(l => l !== DEFAULT_LOCALE)
    const prefixRegex = new RegExp('^/(' + nonDefaultLocales.join('|') + ')(?=/|$)')

    // 'fr-CA' -> 'fr', undefined when the language is not supported
    const supportedLocale = (tag) => {
        const primary = String(tag || '').toLowerCase().split('-')[0]
        return LOCALES.includes(primary) ? primary : undefined
    }

    // First supported language of the browser preferences, e.g. ['de', 'fr-CH', 'en'] -> 'fr'
    const browserLocale = () => {
        const preferences = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]
        for (const tag of preferences) {
            const locale = supportedLocale(tag)
            if (locale) return locale
        }
        return DEFAULT_LOCALE
    }

    const localeFromPath = (pathname) => {
        const match = prefixRegex.exec(pathname)
        return match ? match[1] : DEFAULT_LOCALE
    }

    // '/fr/about' -> '/about', '/fr' -> '/'
    const stripLocale = (pathname) => {
        const stripped = pathname.replace(prefixRegex, '')
        return stripped || '/'
    }

    // '/about' -> '/fr/about' for French, unchanged for English. Accepts a query string.
    const localizePath = (path, locale = I18n.locale) => {
        const bare = stripLocale(path)
        if (locale === DEFAULT_LOCALE) return bare
        if (bare === '/') return '/' + locale
        if (bare.startsWith('/?')) return '/' + locale + bare.slice(1)
        return '/' + locale + bare
    }

    const decodeEntities = (html) => {
        const textarea = document.createElement('textarea')
        textarea.innerHTML = html
        return textarea.value
    }

    // Replaces the content of `el` with the translated `html`, reusing the original inline elements
    // (links, icons, JS hooks) so that their attributes and listeners are kept. Elements are matched by tag name,
    // and by the n="index" attribute when several siblings share a tag.
    const fill = (el, html) => {
        const template = document.createElement('template')
        template.innerHTML = html
        el.replaceChildren(...build(template.content, el))
    }

    const build = (source, target) => {
        const originals = Array.from(target.children)
        const used = new Set()
        const nodes = []

        source.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                nodes.push(document.createTextNode(node.data))
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const sameTag = originals.filter(o => o.localName === node.localName)
                const index = node.getAttribute('n')
                const original = index !== null ? sameTag[Number(index)] : (sameTag.length === 1 ? sameTag[0] : undefined)

                if (original && !used.has(original)) {
                    used.add(original)
                    if (node.firstChild || original.firstChild) original.replaceChildren(...build(node, original))
                    nodes.push(original)
                } else {
                    const clone = document.importNode(node, true)
                    clone.removeAttribute('n')
                    nodes.push(clone)
                }
            }
        })

        // Decorative elements which are not part of the dictionary strings (menu geometries) stay where they were
        originals.forEach((original, i) => {
            const isDecoration = ELEMENTS_TO_KEEP.includes(original.localName) || original.classList.contains('geom')
            if (isDecoration && !used.has(original)) nodes.splice(Math.min(i, nodes.length), 0, original)
        })

        return nodes
    }

    const api = {
        defaultLocale: DEFAULT_LOCALE,
        locales: LOCALES,
        locale: DEFAULT_LOCALE,
        dictionary: {},
        redirecting: false,
        ready: Promise.resolve(),
        supportedLocale,
        browserLocale,
        localeFromPath,
        stripLocale,
        localizePath,
        storedLocale: () => supportedLocale(storage.get()),
        storeLocale: (locale) => storage.set(locale),

        // Translation of a string built in JS. `english` is the source text, {name} placeholders are replaced from `values`.
        t(key, english, values) {
            let text = (this.locale !== DEFAULT_LOCALE && this.dictionary[key]) || english
            if (values) text = text.replace(/\{(\w+)\}/g, (match, name) => name in values ? values[name] : match)
            return text
        },

        // Decimal separator of the current language, for numbers already formatted by toFixed & co
        number(text) {
            return this.locale === 'fr' ? String(text).replace('.', ',') : String(text)
        },

        // Translates every tagged element below `root`, and prefixes internal links with the language
        apply(root) {
            root.querySelectorAll('a[data-route]').forEach(link => {
                if (!link.dataset.routeHref) link.dataset.routeHref = link.getAttribute('href')
                link.setAttribute('href', localizePath(link.dataset.routeHref, this.locale))
            })

            if (this.locale === DEFAULT_LOCALE) return

            const missing = []
            root.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n')
                const value = this.dictionary[key]
                if (!value) return missing.push(key)
                if (el.localName === 'title') el.textContent = decodeEntities(value)
                else fill(el, value)
            })
            root.querySelectorAll('[data-i18n-attr]').forEach(el => {
                el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
                    const [name, key] = pair.split(':')
                    const value = this.dictionary[key]
                    if (value) el.setAttribute(name, value)
                    else missing.push(key)
                })
            })
            if (missing.length) console.warn('[i18n] No ' + this.locale + ' translation for', missing)
        },

        // Keeps <html lang>, language alternates and the language switcher in sync with the displayed page
        pageChanged(fullPath) {
            document.querySelectorAll('.lang-link').forEach(link => {
                const target = link.dataset.lang
                link.setAttribute('href', localizePath(fullPath, target))
                link.classList.toggle('active', target === this.locale)
            })

            const origin = location.origin
            document.querySelectorAll('link[data-i18n-alternate]').forEach(el => el.remove())
            const addAlternate = (hreflang, locale) => {
                const link = document.createElement('link')
                link.rel = 'alternate'
                link.hreflang = hreflang
                link.href = origin + localizePath(fullPath, locale)
                link.setAttribute('data-i18n-alternate', '')
                document.head.appendChild(link)
            }
            LOCALES.forEach(locale => addAlternate(locale, locale))
            addAlternate('x-default', DEFAULT_LOCALE)

            const canonical = document.querySelector('link[rel="canonical"]')
            if (canonical && this.locale !== DEFAULT_LOCALE) canonical.href = origin + localizePath(fullPath)
            const ogLocale = document.querySelector('meta[property="og:locale"]')
            if (ogLocale) ogLocale.setAttribute('content', this.locale)
        },

        // Once the first render is translated, header and footer can be shown (they are hidden meanwhile to avoid an English flash)
        finish() {
            document.documentElement.classList.remove(PENDING_CLASS)
        }
    }

    // Boot
    const hasPrefix = prefixRegex.test(location.pathname)
    const preferred = api.storedLocale() || browserLocale()

    // Landing on an unprefixed URL: send speakers of another supported language to their site, unless they explicitly chose English
    if (!hasPrefix && preferred !== DEFAULT_LOCALE) {
        api.redirecting = true
        location.replace(localizePath(location.pathname, preferred) + location.search + location.hash)
        return api
    }

    // Choosing a language with the switcher is remembered, and wins over the browser preferences next time
    document.addEventListener('click', (event) => {
        const link = event.target.closest && event.target.closest('.lang-link')
        if (link) storage.set(link.dataset.lang)
    })

    api.locale = localeFromPath(location.pathname)
    document.documentElement.lang = api.locale

    if (api.locale !== DEFAULT_LOCALE) {
        document.documentElement.classList.add(PENDING_CLASS)
        setTimeout(api.finish, 3000) // never leave the page hidden if something goes wrong
        api.ready = fetch('/locales/' + api.locale + '.json')
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status)
                return response.json()
            })
            .then(dictionary => { api.dictionary = dictionary })
            .catch(error => console.warn('[i18n] Could not load the ' + api.locale + ' dictionary, falling back to English.', error))
    }

    return api
})()
