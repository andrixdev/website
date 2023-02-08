// This components gathers several previous or new components
var MoreComponent = {
    template: document.querySelector("#more-template"),
    data: function () {
        return { }
    },
    methods: {
        
    },
    mounted: function () {

        // Web-Dataviz Show mores
        document.querySelector(".student-misc-projects").classList.add('hidden')
        document.querySelector(".load-hum-projects").classList.add('hidden')
        document.querySelector(".hum-projects").classList.add('hidden')

        document.querySelector(".load-student-misc-projects").addEventListener('click', (ev) => {
            document.querySelector(".load-student-misc-projects").classList.add('hidden')
            document.querySelector(".student-misc-projects").classList.remove('hidden')
            document.querySelector(".load-hum-projects").classList.remove('hidden')
        })
        document.querySelector(".load-hum-projects").addEventListener('click', (ev) => {
            document.querySelector(".load-hum-projects").classList.add('hidden')
            document.querySelector(".hum-projects").classList.remove('hidden')
        })
    }
}
