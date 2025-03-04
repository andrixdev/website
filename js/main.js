document.addEventListener("DOMContentLoaded", () => {

    // App components (short ones, the others are in separate files)
    let GalleryComponent = {
        template: document.querySelector('#gallery-template'),
        data: function () {
            return { }
        },
        mounted: function ()  {
            // This effing method is called every time, same for other Vue hooks, I'm going full vanillaJS very soon.
            Gallery.update()
        }
    }
    let FilmsComponent = {
        template: document.querySelector('#films-template'),
        data: () => {
            return { }
        },
        mounted: () => { }
    }
    let AndrixBrandComponent = {
        template: document.querySelector('#andrix-brand-template'),
        data: () => {
            return { }
        },
        mounted: () => { }
    }

    // Custom components
    Vue.component('vue-title', HeadTitleComponent)
    Vue.component('geom', {
        template: document.querySelector('#geom-template'),
        props: ['baseSides', 'header', 'rotate'],
        data: function () {
            return {
                newSides: undefined
            }
        },
        mounted: function () {
            this.newSides = this.baseSides
            let self = this
            let glitch = () => {
                self.newSides = self.newSides == 4 ? 0 : 4

                setTimeout(() => {
                    self.newSides = self.newSides == 4 ? 0 : 4
                }, 40)
            }

            // Glitch loop
            setInterval(() => {
                // 10% chance of glitch
                if (Math.random() < 0.1) {
                    // Glitch up to 3 times
                    let glitches = Math.ceil(3 * Math.random())
                    for (let g = 0; g < glitches; g++) {
                        setTimeout(() => {
                            glitch()
                        }, g * 80)
                    }
                }
            }, 1000)
			
        }
    })
    Vue.component('coming-soon', {
        template: document.querySelector('#coming-soon-template')
    })
    Vue.component('inline-svg-logo', {
        template: document.querySelector('#inline-svg-logo-template')
    })

    // App routes
    let routes = [
        { path: '/', component: HomeComponent },
        { path: '/gallery', component: GalleryComponent, pathToRegexpOptions: { strict: true } }, // prevents route bugs with /gallery/
        { path: '/films', component: FilmsComponent },
        { path: '/more', component: MoreComponent },
        { path: '/about', component: AboutComponent },
        { path: '/contact', component: ContactComponent },
        { path: '/andrix', component: AndrixBrandComponent },
        { path: '/cv', redirect: '/more' },
        { path: '/projects', redirect: '/web-dataviz' }, { path: '/web-dataviz', redirect: '/more' },
        { path: '/creative-coding', redirect: '/more' },
        { path: '*', component: NotFoundComponent }
    ]

    // Build router
    Global.router = new VueRouter({
        routes: routes,
        mode: 'history'
    })

    // Scroll to top on route change
    Global.router.beforeEach((to, from, next) => {

        setTimeout(() => {
        	// Scroll back to top unless it's some gallery internal navigation
	        if (!(to.fullPath.indexOf('gallery') > -1 && from.fullPath.indexOf('gallery') > -1)) {
		        window.scrollTo(0, 0)
	        }
        }, 100)

	    // If back button from front Gallery mode, close it
	    console.log("Navigating from " + from.fullPath + " to " + to.fullPath)

        // Going to Gallery or coming from it
	    //if (to.fullPath.indexOf('gallery') > -1 || from.fullPath.indexOf('gallery') > -1) { }
        // Going to Gallery
        if (to.fullPath.indexOf('gallery') > -1) {
		    Gallery.updateFront()
	    }

        next()
    })

    let app = new Vue({
        router: Global.router,
        el: '#alexandrix-website',
        methods: {
            rotateLeHue: () => {
                let hue = Math.round(360 * Math.random())
                document.getElementsByTagName('body')[0].style.filter = 'hue-rotate(' + hue + 'deg)'
                
            }

        },
		mounted: () => {

		}
    })

    const menuTabNodes = document.getElementsByClassName("menu-tab")
    const headerNode = document.getElementsByClassName("header")[0]
    const mobileBurgerNode = document.getElementById("menu-mobile-burger")
    const menuNode = document.getElementById("menu")

    // Dock-up menu on scroll down
    let lastScrollY = window.scrollY
    let header = document.getElementsByClassName('header')[0]
    document.addEventListener('scroll', (ev) => {
        header.classList.toggle('docked', window.scrollY > 60 && window.scrollY > lastScrollY)
        lastScrollY = window.scrollY
    })

    // Mobile burger menu
    let isMenuOpen = false
    let updateMenu = () => {
        mobileBurgerNode.classList.toggle("closed", !isMenuOpen)
        mobileBurgerNode.classList.toggle("open", isMenuOpen)
        headerNode.classList.toggle("mobile-menu-open", isMenuOpen)
    }
    mobileBurgerNode.addEventListener("click", () => {
        isMenuOpen = !isMenuOpen
        updateMenu()
    })
    menuNode.addEventListener("click", () => {
        isMenuOpen = false
        updateMenu()
    })

    // Smooth fade in of menu tabs
    Array.from(menuTabNodes).forEach((e, i) => {
        e.style.opacity = 0
        setTimeout(() => { e.style.opacity = 1 }, 150 * (i - 1))
    })

})
