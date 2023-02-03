// This components gathers several previous or new components
var MoreComponent = {
    template: jQuery('#more-template').html(),
    data: function () {
        return { }
    },
    methods: {
        
    },
    mounted: function () {

        // Web-Dataviz Show mores
        jQuery('.web-dataviz-projects .student-misc-projects').hide()
        jQuery('.web-dataviz-projects .showmore-toggle-bar.load-hum-projects').hide()
        jQuery('.web-dataviz-projects .hum-projects').hide()

        jQuery('.web-dataviz-projects .showmore-toggle-bar.load-student-misc-projects').on('click', function () {
            jQuery('.web-dataviz-projects .student-misc-projects').fadeIn(500)
            jQuery(this).remove()
            jQuery('.web-dataviz-projects .showmore-toggle-bar.load-hum-projects').show()
        });
        jQuery('.web-dataviz-projects .showmore-toggle-bar.load-hum-projects').on('click', function () {
            jQuery('.web-dataviz-projects .hum-projects').fadeIn(500)
            jQuery(this).remove()
        })
    }
}
