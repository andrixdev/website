var EventsComponent = {
    template: document.querySelector('#events-template'),
    data: function () {
        return { }
    },
    mounted: function () {

        // Show past events
        document.querySelector(".load-past-events").addEventListener('click', () => {
            document.querySelector(".showmore-toggle-bar.load-past-events").classList.add('hidden')
            document.querySelector(".past-events").classList.remove('hidden')
        })
    }
}
