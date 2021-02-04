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

	    // Show past dates
	    // I don't give a dayum about JS frameworks anymore, jQuery does the job man
	    jQuery('.past-dates').hide();
	    jQuery('.load-past-dates').on('click', function() {
		    jQuery('.past-dates').show();
		    jQuery('.showmore-toggle-bar.load-past-dates').hide();
	    });

	    // Unveil 03 feb news (2 click layers)
        jQuery('.news-feb-2021 .more-things').hide();
        jQuery('.news-feb-2021 .even-more-things').hide();
        jQuery('.news-feb-2021 .things').on('click', function() {
            jQuery('.news-feb-2021 .things').removeClass('clickable');
            jQuery('.news-feb-2021 .more-things').fadeIn(500);

            jQuery('.news-feb-2021 .more-things').on('click', function() {
                jQuery('.news-feb-2021 .more-things').removeClass('clickable');
                jQuery('.news-feb-2021 .even-more-things').fadeIn(500);
            });
        });


    }
};