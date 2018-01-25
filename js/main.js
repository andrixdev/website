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
                scroll: 0,
            };
        },
        methods: {
            updateHomeGallery: function(el) {
                this.homeGallery = el;
            },
            updateHomeProjects: function(el) {
                this.homeProjects = el;
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
                var maxWidth = $container.width() + window.innerWidth;
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
    var AnimationsComponent = { template: jQuery('#animations-template').html() };
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