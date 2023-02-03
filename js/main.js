document.addEventListener('DOMContentLoaded', () => {

    // App components (short ones, the others are in separate files)
    let GalleryComponent = {
        template: jQuery('#gallery-template').html(),
        data: function () {
            return { }
        },
        mounted: function ()  {
            // This effing method is called every time, same for other Vue hooks, I'm going full vanillaJS very soon.
            Gallery.update()
        }
    }
    let FilmsComponent = {
        template: jQuery('#films-template').html(),
        data: () => {
            return { }
        },
        mounted: () => { }
    }
    let AndrixBrandComponent = {
        template: jQuery('#andrix-brand-template').html(),
        data: () => {
            return { }
        },
        mounted: () => { }
    }

    // Custom components
    Vue.component('vue-title', HeadTitleComponent)
    Vue.component('geom', {
        template: jQuery('#geom-template').html(),
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
    Vue.component('logo-links', {
        template: jQuery('#logo-links-template').html()
    })
    Vue.component('coming-soon', {
        template: jQuery('#coming-soon-template').html()
    })
    Vue.component('inline-svg-logo', {
        template: jQuery('#inline-svg-logo-template').html()
    })

    // App routes
    let routes = [
        { path: '/', component: HomeComponent },
        { path: '/gallery', component: GalleryComponent },
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
        next()

	    // If back button from front Gallery mode, close it
	    console.log("Navigating from " + from.fullPath + " to " + to.fullPath)

        // Going to Gallery or coming from it
	    if (to.fullPath.indexOf('gallery') > -1 || from.fullPath.indexOf('gallery') > -1) {
		    Gallery.update()
	    }

    })

    let app = new Vue({
        router: Global.router,
        el: '#alexandrix-website',
        data: {
            isOpen: false,
            hueAngle: 0,
            saturation: 100
        },
        methods: {
            rotateLeHue: () => {
                this.hueAngle = Math.round(360 * Math.random())
            }
        },
		mounted: () => {

		}
    })

})
