var HomeComponent = {
    template: jQuery('#home-template').html(),
    data: function() {
        return {
            stuff: [
                { ew: 'yeah'},
                { ew: 'yeah'}
            ]
        };
    },
    methods: { },
    mounted: function() {
        var self = this;
        self.home = 'Teh';// This line is used to have the whole lot work

        // Show older news
        jQuery('.news-block').hide();
        var maxNews = jQuery('.news-block').length;
		var shaun = maxNews; //12;
        var showMore = function(shown) {
            // Fade in a certain number of news
	        for (var s = 1; s <= shown; s++) {
		        jQuery('.news-block:nth-of-type(' + s + ')').fadeIn(500);
	        }

	        // Hide LoadMore button if we reached max
	        if (shown >= maxNews) {
		        jQuery('.showmore-toggle-bar.load-more-news').hide();
            }
        };
        showMore(shaun);
        jQuery('.load-more-news').on('click', function() {
            shaun += 4;
            showMore(shaun);
        });
        jQuery('.load-more-news').on('mouseenter', function() {
            shaun += 4;
            showMore(shaun);
        });

    }
};
