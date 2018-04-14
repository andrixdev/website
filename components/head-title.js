// This components helps us have a dynamic <head> > <title> tag
var HeadTitleComponent = {
    name: 'vue-title',
    props: ['title'],
    created: function() {
        document.title = this.title;
    },
    watch: {
        title: function() {
            // only used when the title changes after page load
            document.title = this.title;
        }
    },
    render: function() {

    }
};