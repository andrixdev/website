var HomeComponent = {
    template: jQuery('#home-template').html(),
    data: function() {
        return {
            stuff: [
                { ew: 'yeah'},
                { ew: 'yeah'}
            ],
            homeGallery: undefined,
            homeProjects: undefined,
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
        self.home = 'Teh';// This line is used to have the whole lot work

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
    }
};