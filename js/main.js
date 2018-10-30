document.addEventListener('DOMContentLoaded', function() {

    // If IE, display fallback view and return false
    if (isIE()) {
        var ieBlock = document.getElementById('ie-fallback');
        var body = document.getElementsByTagName('body')[0]
        body.innerHTML = ieBlock.outerHTML;
        ieBlock.style.display = 'inherit';
        body.className += ' ie';
        return false;
    }

    // App components (short ones, the others are in separate files)
    var GalleryComponent = {
        template: jQuery('#gallery-template').html(),
        data: function() {
            return { }
        },
        mounted: function()  { Gallery.go(); }
    };
    var ProjectsComponent = {
        template: jQuery('#projects-template').html(),
        data: function() {
            return { }
        },
        mounted: function() { Projects.go(); }
    };
    var CVComponent = {
        template: jQuery('#cv-template').html(),
        data: function() {
            return { }
        },
        mounted: function() { CV.go(); }
    };

    // Custom components
    Vue.component('vue-title', HeadTitleComponent);
    Vue.component('geom', {
        template: jQuery('#geom-template').html(),
        props: ['baseSides', 'header', 'rotate'],
        data: function() {
            return {
                newSides: undefined
            }
        },
        mounted: function() {
            this.newSides = this.baseSides;
            var self = this;
            var glitch = function() {
                self.newSides = self.newSides == 4 ? 0 : 4;

                setTimeout(function() {
                    self.newSides = self.newSides == 4 ? 0 : 4;
                }, 80);
            };

            // Glitch loop
            setInterval(function() {
                // 10% chance of glitch
                if (Math.random() < 0.1) {
                    // Glitch up to 3 times
                    var glitches = Math.ceil(3 * Math.random());
                    for (var g = 0; g < glitches; g++) {
                        setTimeout(function() {
                            glitch();
                        }, g * 150);
                    }
                }
            }, 1000);
        }
    });
    Vue.component('logo-links', {
        template: jQuery('#logo-links-template').html()
    });
    Vue.component('coming-soon', {
        template: jQuery('#coming-soon-template').html()
    });
    Vue.component('inline-svg-logo', {
        template: jQuery('#inline-svg-logo-template').html()
    });

    // App routes
    var routes = [
        { path: '/', component: HomeComponent },
        { path: '/gallery', component: GalleryComponent },
        { path: '/projects', component: ProjectsComponent },
        { path: '/more', component: MoreComponent },
        { path: '/about', component: AboutComponent },
        { path: '/contact', component: ContactComponent },
        { path: '/cv', component: CVComponent },
        { path: '*', component: NotFoundComponent }
    ];

    // Build router
    Global.router = new VueRouter({
        routes: routes,
        mode: 'history'
    });

    // Scroll to top on route change
    Global.router.beforeEach(function(to, from, next) {
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 100);
        next();
    });

    var app = new Vue({
        router: Global.router,
        el: '#alexandrix-website',
        data: {
            isOpen: false,
            hueAngle: 0
        },
        methods: {
            rotateLeHue: function() {
                this.hueAngle = Math.round(360 * Math.random());
            }
        }
    });

});