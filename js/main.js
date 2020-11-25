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
        template: jQuery('#web-dataviz-template').html(),
        data: function() {
            return { }
        },
        mounted: function() { Projects.go(); }
    };
    var VRComponent = {
        template: jQuery('#vr-template').html(),
        data: function() {
            return { }
        },
        mounted: function() { }
    };
    var CreativeCodingComponent = {
        template: jQuery('#cc-template').html(),
        data: function() {
            return { }
        },
        mounted: function() { }
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
        { path: '/projects', redirect: '/web-dataviz' },
        { path: '/web-dataviz', component: ProjectsComponent },
        { path: '/vr', component: VRComponent },
        { path: '/creative-coding', component: CreativeCodingComponent },
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

    /*
    // New Vueless router
    Global.router2 = {
        currentPath: location.pathname
    };

    Global.router2.init = function() {
	    location.lasthash = [];
	    callComponent(location.pathname);
    };

	function updateHistory(curr) {
		location.lasthash.push(location.hash);
		location.hash = curr;
		if (location.href.indexOf("#") > -1) {
			location.assign(location.href.replace(/\/?#/, "/"));
		}
	}
	function goBack() {
		location.hash = location.lasthash[location.lasthash.length-1];
		location.lasthash.pop();
	}
	function callComponent(hash) {
	    console.log('Component hash is ' + hash);
    }
    jQuery('[data-navto]').on('click', function() {
        console.log('Klik');
        Global.router2.navigate(jQuery(this).attr('data-navto'));
    });
    Global.router2.navigate = function(newHash) {
        if (location.hash == newHash) return false;

	    updateHistory(newHash);
	    callComponent(newHash);
    };
	Global.router2.init();

    */

    // Scroll to top on route change
    Global.router.beforeEach(function(to, from, next) {


        setTimeout(function() {
        	// Scroll back to top unless it's some gallery internal navigation
	        if (!(to.fullPath.indexOf('gallery') > -1 && from.fullPath.indexOf('gallery') > -1)) {
		        window.scrollTo(0, 0);
	        }
        }, 100);
        next();

	    // If back button from front Gallery mode, close it
	    console.log(to.fullPath, from.fullPath);
	    if (to.fullPath.indexOf('gallery') > -1 || from.fullPath.indexOf('gallery') > -1) {
		    console.log(to.fullPath, from.fullPath);
		    // Going to Gallery or coming from it
		    if (to.fullPath.indexOf('art-id') === -1) Gallery.shouldShowFront = false;
		    else Gallery.shouldShowFront = true;
		    Gallery.applyState();
	    }

    });

    var app = new Vue({
        router: Global.router,
        el: '#alexandrix-website',
        data: {
            isOpen: false,
            hueAngle: 0,
            saturation: 100
        },
        methods: {
            rotateLeHue: function() {
                this.hueAngle = Math.round(360 * Math.random());
            }
        },
		mounted: function() {
            var self = this;
            var glitchSat = function() {
                self.saturation = 0

                setTimeout(function() {
                    self.saturation = 100
                }, 100);
            }

			setInterval(function() {
                if (Math.random() < 0.01) {
                    glitchSat();
                }
            }, 100);
		}
    });

});