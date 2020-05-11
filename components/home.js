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
        // I don't give a f*ck about JS frameworks anymore, jQuery does the job man
        jQuery('.news-block').hide();
        var shaun = 12, maxNews = jQuery('.news-block').length;
        var showMore = function(shown) {
            // Fade in a certain number of news
	        for (var s = 1; s <= shown; s++) {
		        jQuery('.news-block:nth-of-type(' + s + ')').fadeIn(500);
	        }

	        // Hide LoadMore button if we reached max
	        if (shown >= maxNews) {
		        jQuery('.loadmore').hide();
            }
        };
        showMore(shaun);
        jQuery('.loadmore').on('click', function() {
            shaun += 4;
            showMore(shaun);
        });
        jQuery('.loadmore').on('mouseenter', function() {
            shaun += 4;
            showMore(shaun);
        });

	    // Show older news
	    // I don't give a dayum about JS frameworks anymore, jQuery does the job man
	    jQuery('.past-dates').hide();

	    jQuery('.load-past-dates').on('click', function() {
		    jQuery('.past-dates').show();
		    jQuery('.showmore-toggle-bar').hide();
	    });

    }
};