var HomeComponent = {
    template: document.querySelector('#home-template'),
    data: function () {
        return {
            stuff: [
                { ew: 'yeah'},
                { ew: 'yeah'}
            ]
        }
    },
    methods: { },
    mounted: function () {
        var self = this
        self.home = 'Teh'// This line is used to have the whole lot work

        // Show older news
        let news = document.querySelectorAll(".news-block")
        news.forEach(el => el.classList.add('hidden'))
        var maxNews = news.length
		var shaun = maxNews // Show all news right from start for now
        var showMore = (shown) => {
            // Fade in a certain number of news
	        for (var s = 1; s <= shown; s++) {
		        document.querySelector(".news-block:nth-of-type(" + s + ")").classList.remove('hidden')
	        }
	        // Hide LoadMore button if we reached max
	        if (shown >= maxNews) {
		        document.querySelector(".load-more-news").classList.add('hidden')
            }
        }
        showMore(shaun)
        document.querySelector(".load-more-news").addEventListener('click', () => {
            shaun += 4
            showMore(shaun)
        })

        // Zoomable news images
        document.querySelectorAll("#home .news-block img:not(.non-zoomable)").forEach(el => {
            el.addEventListener("click", (ev) => {
                let elt = ev.target
                elt.classList.toggle("clicked")
                if (elt.classList.contains("clicked")) updateImageZoomOrigin(elt)
            })
        })
    }
}
