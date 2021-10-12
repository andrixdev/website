// This components gathers several previous or new components
var MoreComponent = {
    template: jQuery('#more-template').html(),
    data: function() {
        return {
            animationPaths: [],
            displayedPaths: [],
            maxAnim: 3,
            seenAnims: []// Array with indexes of seen animations
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
            this.updateSeenAnimsWithNewDisplayedAnimations();
        },
        updateSeenAnimsWithNewDisplayedAnimations: function() {
            // Compare with existing stored paths, add only if new
            // Don't mind about pushing on the very array being looped on
            var self = this;
            this.displayedPaths.forEach(function(el) {
                var isInSeenAnims = false;
                for (var a = 0; a < self.seenAnims.length; a++) {
                    if (el === self.seenAnims[a]) isInSeenAnims = true;
                }
                if (!isInSeenAnims) self.seenAnims.push(el);
            });
        },
    },
    mounted: function() {
        var self = this;

        // Store all animation paths
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

        // Web-Dataviz project links
        jQuery('.web-dataviz-projects .project-tile').on({
            mouseenter: function() {

            }, mouseleave: function() {

            }, mouseup: function() {
                var goToLink = jQuery(this).find('a').attr('href');
                if (!!goToLink) window.open(goToLink, '_blank');
            }
        });

        // Web-Dataviz Show mores
        jQuery('.web-dataviz-projects .student-misc-projects').hide();
        jQuery('.web-dataviz-projects .showmore-toggle-bar.load-hum-projects').hide();
        jQuery('.web-dataviz-projects .hum-projects').hide();

        jQuery('.web-dataviz-projects .showmore-toggle-bar.load-student-misc-projects').on('click', function () {
            jQuery('.web-dataviz-projects .student-misc-projects').fadeIn(500);
            jQuery(this).remove();
            jQuery('.web-dataviz-projects .showmore-toggle-bar.load-hum-projects').show();
        });
        jQuery('.web-dataviz-projects .showmore-toggle-bar.load-hum-projects').on('click', function () {
            jQuery('.web-dataviz-projects .hum-projects').fadeIn(500);
            jQuery(this).remove();
        });
    }
};
