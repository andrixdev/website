let updateImageZoomOrigin = (imgNode) => {
    // Compute X zoom offset on-the-fly to zoom into images
    const rect = imgNode.getBoundingClientRect()
    let w = window.innerWidth
    let xCenterRatio = ((rect.right + rect.left) / 2) / w
    let spanRatio = (rect.right - rect.left) / w
    let strength = 1.5 // Strength of 2 doubles the natural offset
    strength += 2.7 * spanRatio // This adds more even offset to wider images
    let percentOffsetX = Math.max(0, Math.min(100, 50 + strength * (Math.round(100 * xCenterRatio) - 50))) // Clamp [0, 100]
    imgNode.style.transformOrigin = percentOffsetX + "% 50%"
}

const LAZY_PLACEHOLDER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAuMBgSAm4QAAAABJRU5ErkJggg=="

const lazyImageObserver = ('IntersectionObserver' in window) ? new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const img = entry.target
        const src = img.dataset.src
        if (src) {
            img.src = src
            img.removeAttribute('data-src')
        }
        img.loading = 'lazy'
        img.decoding = 'async'
        observer.unobserve(img)
    })
}, { rootMargin: '200px 0px', threshold: 0.01 }) : null

function initLazyImages(root = document) {
    if (!lazyImageObserver) return

    root.querySelectorAll('img[loading="lazy"]').forEach(img => {
        if (img.dataset.lazyManaged) return
        img.dataset.lazyManaged = '1'

        if (!img.dataset.src && img.src) {
            img.dataset.src = img.src
            img.src = LAZY_PLACEHOLDER
        }

        lazyImageObserver.observe(img)
    })
}

// Simple components (previously Vue components)
const GalleryComponent = {
    template: document.querySelector('#gallery-template'),
    mounted: function () { Gal.hey() }
}

const FilmsComponent = {
    template: document.querySelector('#films-template'),
    mounted: function () {
        document.querySelectorAll('.films-projects img:not(.non-zoomable)').forEach(el => {
            el.addEventListener('click', (ev) => {
                let elt = ev.target
                elt.classList.toggle('clicked')
                if (elt.classList.contains('clicked')) updateImageZoomOrigin(elt)
            })
        })
    }
}

const AndrixBrandComponent = {
    template: document.querySelector('#andrix-brand-template'),
    mounted: function () { }
}

// Simple client-side router (history API)
class Router {
    constructor(routes) {
        this.routes = routes
        this.beforeEachHooks = []
        this.afterEachHooks = []
        this.currentRoute = null
        this._cleanupFns = []
    }

    normalizePath(path) {
        if (!path) return '/'
        // If path includes query/hash, strip it
        path = path.split('?')[0].split('#')[0]
        if (!path.startsWith('/')) path = '/' + path
        // Remove trailing slash (except root)
        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1)
        }
        return path
    }

    parseQuery(search) {
        let q = {}
        if (!search) return q
        if (search.startsWith('?')) search = search.slice(1)
        search.split('&').forEach(pair => {
            if (!pair) return
            let [k, v] = pair.split('=')
            q[decodeURIComponent(k)] = v === undefined ? '' : decodeURIComponent(v)
        })
        return q
    }

    buildFullPath(path, query) {
        let q = query || {}
        let keys = Object.keys(q)
        if (!keys.length) return path
        let qs = keys.map(k => encodeURIComponent(k) + '=' + encodeURIComponent(q[k])).join('&')
        return path + '?' + qs
    }

    matchRoute(path) {
        const normalized = this.normalizePath(path)
        // Exact match first
        let match = this.routes.find(r => r.path === normalized)
        if (match) return match
        // Wildcard
        return this.routes.find(r => r.path === '*')
    }

    push(location) {
        this.navigate(location, { replace: false })
    }

    replace(location) {
        this.navigate(location, { replace: true })
    }

    onPopState() {
        this.navigate({ path: window.location.pathname, query: this.parseQuery(window.location.search) }, { replace: true, skipHistory: true })
    }

    navigate(location, { replace = false, skipHistory = false } = {}) {
        const raw = typeof location === 'string' ? { path: location } : (location || {})
        const path = this.normalizePath(raw.path || window.location.pathname)
        const query = raw.query || this.parseQuery(window.location.search)

        const to = { path, query, fullPath: this.buildFullPath(path, query) }
        const from = this.currentRoute || { path: window.location.pathname, query: this.parseQuery(window.location.search), fullPath: window.location.href }

        const proceed = () => {
            const route = this.matchRoute(path)

            // Handle redirects
            if (route && route.redirect) {
                let target = typeof route.redirect === 'function' ? route.redirect(to) : route.redirect
                return this.navigate({ path: target, query }, { replace: true, skipHistory })
            }

            // Update history
            if (!skipHistory) {
                const state = { path: to.path, query: to.query }
                const url = to.fullPath
                if (replace) history.replaceState(state, '', url)
                else history.pushState(state, '', url)
            }

            this._runCleanup()
            this._renderRoute(route || this.matchRoute('*'), to, from)
            this.currentRoute = to
        }

        this._runBeforeEach(to, from, proceed)
    }

    _runBeforeEach(to, from, done) {
        let index = 0
        const next = (param) => {
            if (param === false) return
            if (typeof param === 'string' || (param && typeof param === 'object')) {
                return this.navigate(param, { replace: false })
            }
            const hook = this.beforeEachHooks[index++]
            if (hook) {
                hook(to, from, next)
            } else {
                done()
            }
        }
        next()
    }

    _runAfterEach(to, from) {
        this.afterEachHooks.forEach(hook => {
            try { hook(to, from) } catch (e) { console.error(e) }
        })
    }

    beforeEach(fn) {
        this.beforeEachHooks.push(fn)
    }

    afterEach(fn) {
        this.afterEachHooks.push(fn)
    }

    registerCleanup(fn) {
        if (typeof fn === 'function') this._cleanupFns.push(fn)
    }

    _runCleanup() {
        this._cleanupFns.forEach(fn => {
            try { fn() } catch (e) { console.error(e) }
        })
        this._cleanupFns = []
    }

    _renderRoute(route, to, from) {
        const view = document.getElementById('view')
        if (!view) return

        // Insert route template
        view.innerHTML = ''
        const fragment = this._createRouteFragment(route)
        view.appendChild(fragment)

        // Post-process custom components (vue-title, geom, etc.)
        processCustomComponents(view)

        // Lazy-load images if any
        initLazyImages(view)

        // Component mounted callback
        if (route && route.component && typeof route.component.mounted === 'function') {
            // Bind methods to the component instance (like Vue does)
            if (route.component.methods) {
                Object.assign(route.component, route.component.methods)
            }
            try {
                route.component.mounted.call(route.component, to, from)
            } catch (e) {
                console.error('Error in component mounted:', e)
            }
        }

        // Update active menu tabs
        updateActiveMenu(to.path)

        // Run after hooks
        this._runAfterEach(to, from)
    }

    _createRouteFragment(route) {
        const frag = document.createDocumentFragment()
        if (!route || !route.component) return frag

        const tpl = route.component.template
        if (!tpl) return frag

        if (tpl instanceof HTMLTemplateElement) {
            frag.appendChild(tpl.content.cloneNode(true))
        } else if (typeof tpl === 'string') {
            const wrapper = document.createElement('div')
            wrapper.innerHTML = tpl
            while (wrapper.firstChild) frag.appendChild(wrapper.firstChild)
        } else if (tpl instanceof Node) {
            frag.appendChild(tpl.cloneNode(true))
        }
        return frag
    }
}

function processCustomComponents(root) {
    // Update document title from <vue-title>
    root.querySelectorAll('vue-title').forEach((el) => {
        const title = el.getAttribute('title')
        if (title) document.title = title
        el.remove()
    })

    // Replace <geom> tags with rendered DOM
    root.querySelectorAll('geom').forEach(el => initGeom(el))

    // Replace <inline-svg-logo> with its template
    root.querySelectorAll('inline-svg-logo').forEach(el => initInlineSvgLogo(el))

    // Replace <coming-soon> with its template
    root.querySelectorAll('coming-soon').forEach(el => initComingSoon(el))
}

function initGeom(el) {
    const baseSides = Number(el.getAttribute('base-sides')) || 0
    const header = el.getAttribute('header') === 'true'
    const rotate = el.getAttribute('rotate') === 'true'

    const wrapper = document.createElement('div')
    wrapper.className = 'geom' + (header ? ' in-header' : '')

    const shape = document.createElement('div')
    const applyShape = (sides) => {
        shape.className = 'shape ' + (sides === 4 ? 'square' : 'circle') + (rotate ? ' tilted' : '')
    }
    applyShape(baseSides)
    wrapper.appendChild(shape)

    let currentSides = baseSides
    const glitch = () => {
        currentSides = currentSides === 4 ? 0 : 4
        applyShape(currentSides)
        setTimeout(() => {
            currentSides = currentSides === 4 ? 0 : 4
            applyShape(currentSides)
        }, 40)
    }

    const interval = setInterval(() => {
        if (Math.random() < 0.1) {
            const glitches = Math.ceil(3 * Math.random())
            for (let g = 0; g < glitches; g++) {
                setTimeout(glitch, g * 80)
            }
        }
    }, 1000)

    // Keep track to clear on navigation
    if (Global && Global.router) {
        Global.router.registerCleanup(() => clearInterval(interval))
    }

    el.replaceWith(wrapper)
}

function initInlineSvgLogo(el) {
    const template = document.querySelector('#inline-svg-logo-template')
    if (!template) return
    const clone = template.content.cloneNode(true)
    el.replaceWith(clone)
}

function initComingSoon(el) {
    const template = document.querySelector('#coming-soon-template')
    if (!template) return
    const clone = template.content.cloneNode(true)
    el.replaceWith(clone)
}

function updateActiveMenu(path) {
    const normalized = path.replace(/\/?$/, '') || '/'
    document.querySelectorAll('.menu-tab').forEach(el => {
        const href = el.getAttribute('href') || ''
        const anchorPath = (href.split('?')[0] || '/').replace(/\/?$/, '') || '/'
        el.classList.toggle('active', anchorPath === normalized)
    })
}

function rotateLeHue() {
    let hue = Math.round(360 * Math.random())
    document.body.style.filter = 'hue-rotate(' + hue + 'deg)'
}

function safeClickHandler(event) {
    const link = event.target.closest('a[data-route]')
    if (!link) return
    if (event.defaultPrevented) return
    const href = link.getAttribute('href')
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return
    event.preventDefault()
    Global.router.push({ path: href })
}

function initApp() {
    const routes = [
        { path: '/', component: HomeComponent },
        { path: '/gallery', component: GalleryComponent },
        { path: '/films', component: FilmsComponent },
        { path: '/more', component: MoreComponent },
        { path: '/about', component: AboutComponent },
        { path: '/contact', component: ContactComponent },
        { path: '/andrix', component: AndrixBrandComponent },
        { path: '/cv', redirect: '/more' },
        { path: '/projects', redirect: '/web-dataviz' },
        { path: '/web-dataviz', redirect: '/more' },
        { path: '/creative-coding', redirect: '/more' },
        { path: '*', component: NotFoundComponent }
    ]

    Global.router = new Router(routes)

    // Listeners
    document.addEventListener('click', safeClickHandler)
    window.addEventListener('popstate', () => Global.router.onPopState())

    const footer = document.getElementById('footer-rotate')
    if (footer) {
        footer.addEventListener('click', rotateLeHue)
    }

    // Display first page
    Global.router.navigate({ path: window.location.pathname, query: Global.router.parseQuery(window.location.search) }, { replace: true, skipHistory: true })

    // Process custom components in the entire document (e.g., menu geoms)
    processCustomComponents(document)

    // Animations
    fadeInTitles()
    fadeInBanner()

    const headerNode = document.getElementsByClassName('header')[0]
    const mobileBurgerNode = document.getElementById('menu-mobile-burger')
    const menuNode = document.getElementById('menu')
    const menuTabNodes = document.getElementsByClassName('menu-tab')

    // Dock-up menu on scroll down
    let lastScrollY = window.scrollY
    document.addEventListener('scroll', () => {
        headerNode.classList.toggle('docked', window.scrollY > 60 && window.scrollY > lastScrollY)
        lastScrollY = window.scrollY
    })

    // Mobile burger menu
    let isMenuOpen = false
    const updateMenu = () => {
        mobileBurgerNode.classList.toggle('closed', !isMenuOpen)
        mobileBurgerNode.classList.toggle('open', isMenuOpen)
        headerNode.classList.toggle('mobile-menu-open', isMenuOpen)
        if (isMenuOpen) fadeInMenuTabs()
    }
    mobileBurgerNode.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen
        updateMenu()
    })
    menuNode.addEventListener('click', () => {
        isMenuOpen = false
        updateMenu()
    })

    // Smooth fade in of menu tabs
    const fadeInMenuTabs = () => {
        Array.from(menuTabNodes).forEach((e, i) => {
            e.style.transition = 'background 300ms ease-in'
            e.style.opacity = 0
            e.style.transition = 'background 300ms ease-in, opacity 300ms ease-in'
            setTimeout(() => {
                e.style.opacity = 1
            }, 100 * (i - 1))
        })
    }

    fadeInMenuTabs()

    // Hooks (mimic previous Vue router hooks)
    Global.router.beforeEach((to, from, next) => {
        fadeOutBanner()
        setTimeout(() => { window.scrollTo(0, 0) }, 150)
        setTimeout(next, 150)
    })

    Global.router.afterEach((to, from) => {
        fadeInTitles()
        setTimeout(fadeInBanner, 1)

        const isComingFromGallery = from.path === '/gallery'
        const isGoingToGallery = to.path === '/gallery'

        if (isGoingToGallery) {
            setTimeout(() => {
                if (typeof Gallery !== 'undefined') Gallery.update()
            }, 1)
        }
        if (isComingFromGallery && !isGoingToGallery) {
            if (typeof Gallery !== 'undefined') Gallery.hideFront()
        }
    })
}

// Reuse existing fade helper functions
let fadeInTitles = () => {
    setTimeout(() => {
        Array.from(document.querySelectorAll('.title-block')).forEach((el, index) => {
            let h1 = el.querySelector('h1')
            let geom = el.querySelector('.geom')
            if (!h1 || !geom) return

            h1.style.transition = 'none'
            geom.style.transition = 'none'

            h1.style.opacity = 0
            geom.style.opacity = 0
            geom.style.marginLeft = '30vw'

            setTimeout(() => {
                h1.style.transition = 'opacity 600ms ease-in'
                h1.style.transitionDelay = (100 + index * 200) + 'ms'
                geom.style.transition = 'opacity 600ms ease-in, margin-left 400ms cubic-bezier(.17,.84,.44,1)'
                geom.style.transitionDelay = (100 + index * 200) + 'ms, ' + index * 200 + 'ms'

                h1.style.opacity = 1
                geom.style.opacity = 1
                geom.style.marginLeft = '0vw'
            }, 1)
        })
    }, 1)
}

let fadeOutBanner = () => {
    let banner = document.querySelector('.page-banner')
    if (!banner) return
    banner.style.transition = 'opacity 200ms'
    banner.style.transitionDelay = '0s, 0s'
    banner.style.opacity = 0
}

let fadeInBanner = () => {
    let banner = document.querySelector('.page-banner')
    if (!banner) return
    let yPos = Number(banner.getAttribute('data-y-pos'))
    banner.style.transition = 'none'
    banner.style.backgroundPositionY = yPos - 15 + '%'

    setTimeout(() => {
        banner.style.transition = 'opacity 400ms, background-position-y 300ms'
        banner.style.transitionDelay = '100ms, 0ms'
        banner.style.opacity = 1
        banner.style.backgroundPositionY = yPos + '%'
    }, 1)
}

// Kick off app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp)
} else {
    initApp()
}
