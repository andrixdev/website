var AnimationsComponent = {
    template: jQuery('#animations-template').html(),
    data: function() {
        return {
            animationPaths: [],
            displayedPaths: [],
            maxAnim: 3,
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