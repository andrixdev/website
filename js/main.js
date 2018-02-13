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
	
    // App views
    var HomeComponent = {
        template: jQuery('#home-template').html(),
        props: ['home'],
        data: function() {
            return {
                stuff: [
                    { ew: 'yeah'},
                    { ew: 'yeah'}
                ],
                homeGallery: undefined,
                homeProjects: undefined,
                homeDisplayedAnimations: undefined,
                maxAnimHome: 6
            };
        },
        methods: {
            updateHomeGallery: function(el) {
                this.homeGallery = el;
            },
            updateHomeProjects: function(el) {
                this.homeProjects = el;
            },
            updateHomeDisplayedAnimations: function(el) {
                this.homeDisplayedAnimations = el;
            },
            scrollLeft: function(ev) {
                // Prevent rerouting
                ev.preventDefault();

                // Get scroll value stored in DOM
                var $container = jQuery(ev.currentTarget).siblings('.showcase');
                var scroll = $container.attr('data-scroll');

                // Go back! (prevent negative)
                scroll -= 300;
                if (scroll < 0) scroll = 0;

                // Call jQuery scroll and save value back in DOM
                $container.scrollLeft(scroll);
                $container.attr('data-scroll', scroll);
            },
            scrollRight: function(ev) {
                // Prevent rerouting
                ev.preventDefault();

                // Get scroll value stored in DOM
                var $container = jQuery(ev.currentTarget).siblings('.showcase');
                var scroll = $container.attr('data-scroll');

                // Get wrapper data for computation of max scroll based on width
                var $wrapper = $container.find('.showcase-wrapper');
                var wrapperWidthPX = $wrapper.css('width');
                var wrapperWidth = wrapperWidthPX.substr(0, wrapperWidthPX.length - 2);
                var maxWidth = wrapperWidth - window.innerWidth;

                // Go back! (prevent negative)
                scroll -= (-300);
                if (scroll > maxWidth) scroll = maxWidth;

                // Call jQuery scroll and save value back in DOM
                $container.scrollLeft(scroll);
                $container.attr('data-scroll', scroll);
            }
        },
        mounted: function() {
            var self = this;
            self.home = 'Teh';// This line used to have the whole lot work

            // Home Gallery
            jQuery
                .get("data/algories.xml", {})
                .done(function(data) {

                    var paths = [];

                    var jAlgories = jQuery(data).find('algories');
                    jAlgories.find('category').each(function() {
                        jQuery(this).find('alg').each(function() {
                            var path = "img/" + jQuery(this).find('small').text();
                            paths.push(path);
                        });
                    });

                    self.updateHomeGallery(paths);
                });

            // Home Projects
            jQuery
                .get("data/projects.xml", {})
                .done(function(data) {

                    var jProjects = jQuery(data).find('projects');
                    var paths = [];

                    jProjects.find('project').each(function(index) {
                        // Get XML content
                        var path = jQuery(this).find('image').text();
                        paths.push(path);
                    });

                    self.updateHomeProjects(paths);
                });

            // Home displayed animations (random selections)
            jQuery
                .get("data/animations.xml", {})
                .done(function(data) {

                    var jAnimations = jQuery(data).find('animations');
                    var paths = [];

                    jAnimations.find('image').each(function(el) {
                        // Get XML content
                        paths.push(jQuery(this).text());
                    });

                    var somePaths = randomizePaths(paths, self.maxAnimHome);
                    self.updateHomeDisplayedAnimations(somePaths);
                });


        }

    };
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
    var AnimationsComponent = {
        template: jQuery('#animations-template').html(),
        data: function() {
            return {
                animationPaths: [],
                displayedPaths: [],
                maxAnim: 4,
                seen: []// Array with indexes of seen animations
            }
        },
        methods: {
            updateAnimationPaths: function(el) {
                this.animationPaths = el;
            },
            updateDisplayedPaths: function(el) {
                this.displayedPaths = el;
            },
            randomizeDisplayedPaths: function() {
                this.updateDisplayedPaths(randomizePaths(this.animationPaths, this.maxAnim));
                this.updateSeenWithNewDisplayedAnimations();
            },
            updateSeenWithNewDisplayedAnimations: function() {
                // Compare with existing stored paths, add only if new
                // Don't mind about pushing on the very array being looped on
                var self = this;
                this.displayedPaths.forEach(function(el) {
                    var isInSeen = false;
                    for (var a = 0; a < self.seen.length; a++) {
                        if (el === self.seen[a]) isInSeen = true;
                    }
                    if (!isInSeen) self.seen.push(el);
                });
            }
        },
        mounted: function() {
            var self = this;

            // Store all paths
            jQuery
                .get("data/animations.xml", {})
                .done(function(data) {

                    var paths = [];

                    var jAnimations = jQuery(data).find('animations');
                    jAnimations.find('image').each(function(el) {
                        paths.push(jQuery(this).text());
                    });
                    self.updateAnimationPaths(paths);

                    // Now display some of them
                    self.randomizeDisplayedPaths();
                });
        }
    };
    var VjingComponent = { template: jQuery('#vjing-template').html() };
    var AboutComponent = {
        template: jQuery('#about-template').html(),
        data: function() {
            return {
                showRiddle: false,
                riddleAnswer: undefined
            }
        },
        methods: {
            submitRiddle: function() {
                console.log(this.riddleAnswer);
                if (true) {
                    this.animateTryAgain();
                }
            },
            animateTryAgain: function() {
                var $error = jQuery('.riddle-input p.error');
                $error.animate({ opacity: 1 }, 500);
                setTimeout(function() {
                    $error.animate({ opacity: 0 }, 1000);
                }, 3000);
            }
        }
    };
    var ContactComponent = { template: jQuery('#contact-template').html() };
    var CVComponent = {
        template: jQuery('#cv-template').html(),
        data: function() {
            return { }
        },
        mounted: function() { CV.go(); }
    };

    // Custom components
    Vue.component('geom', {
        template: jQuery('#geom-template').html(),
        props: ['sides', 'header', 'rotate']
    });
    Vue.component('logo-links', {
        template: jQuery('#logo-links-template').html()
    });
    Vue.component('coming-soon', {
        template: jQuery('#coming-soon-template').html()
    });

    // App routes
    var routes = [
        { path: '/', component: HomeComponent },
        { path: '/gallery', component: GalleryComponent },
        { path: '/projects', component: ProjectsComponent },
        { path: '/animations', component: AnimationsComponent },
        { path: '/vjing', component: VjingComponent },
        { path: '/about', component: AboutComponent },
        { path: '/contact', component: ContactComponent },
        { path: '/cv', component: CVComponent }
    ];

    // Build router
    var router = new VueRouter({
        routes: routes
    });

    // Scroll to top on route change
    router.beforeEach(function(to, from, next) {
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 100);
        next();
    });

    var app = new Vue({
        router: router,
        el: '#icosacid-website',
        data: {
            isOpen: false,
            home: {
                gallery: [],
                projects: []
            }
        }
    });

});

// Returns [4, 0, 1, 3, 2] for maxNumber = 5, for instance
function randomIndexes(maxNumber) {
    var arr = [];

    while (arr.length < maxNumber) {
        var newRand = Math.floor(maxNumber * Math.random());
        var isAlreadyThere = false;
        for (var i = 0; i < arr.length; i++) {
            if (newRand == arr[i]) isAlreadyThere = true;
        }
        if (!isAlreadyThere) arr.push(newRand);
    }

    return arr;
}

/**
 *
 * @param {Array} paths
 * @param {Number} maxNumber
 * @returns Only *maxNumber* randomly chosen paths
 */
function randomizePaths(paths, maxNumber) {
    var output = [];
    var total = paths.length;

    // Pick random animations
    var swapped = randomIndexes(total);
    var indexes = swapped.slice(0, maxNumber);

    for (var ind = 0; ind < indexes.length; ind++) {
        output.push(paths[indexes[ind]]);
    }

    return output;
}

function isIE() {
	var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    return (msie > 0 || !!ua.match(/Trident.*rv\:11\./));
}

function isIEorEdge() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
	var edge = ua.indexOf('Edge/');

    return (msie > 0 || !!ua.match(/Trident.*rv\:11\./) || edge > 0); 
}