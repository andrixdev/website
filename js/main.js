document.addEventListener('DOMContentLoaded', function() {

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
                scroll: 0,
                maxAnimHome: 3
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
                ev.preventDefault();
                this.scroll -= 300;
                if (this.scroll < 0) this.scroll = 0;
                var $container = jQuery(ev.currentTarget).siblings('.showcase');
                $container.scrollLeft(this.scroll);
            },
            scrollRight: function(ev) {
                ev.preventDefault();
                this.scroll += 300;
                var $container = jQuery(ev.currentTarget).siblings('.showcase');
                var $wrapper = $container.find('.showcase-wrapper');
                var wrapperWidthPX = $wrapper.css('width');
                var wrapperWidth = wrapperWidthPX.substr(0, wrapperWidthPX.length - 2);
                var maxWidth = wrapperWidth - window.innerWidth;
                if (this.scroll > maxWidth) this.scroll = maxWidth;

                $container.scrollLeft(this.scroll);
            }
        },
        mounted: function() {
            var self = this;
            self.home = 'Teh';// This line used to have the whole lot work

            // Home Gallery
            jQuery
                .get("algories.xml", {})
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
                .get("projects.xml", {})
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
                .get("animations.xml", {})
                .done(function(data) {

                    var jAnimations = jQuery(data).find('animations');
                    var paths = [];

                    jAnimations.find('image').each(function(el) {
                        // Get XML content
                        paths.push(jQuery(this).text());
                    });

                    self.updateHomeDisplayedAnimations(randomizePaths(paths, this.maxAnimHome));
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
                maxAnim: 4
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
                this.displayedPaths = randomizePaths(this.animationPaths, this.maxAnim);
            }
        },
        mounted: function() {
            var self = this;

            // Store all paths
            jQuery
                .get("animations.xml", {})
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
    var AboutComponent = { template: jQuery('#about-template').html() };
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