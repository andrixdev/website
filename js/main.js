document.addEventListener('DOMContentLoaded', function() {

    // If IE, display fallback view and return false
    if (isIE()) {
        var ieBlock = document.getElementById('ie-fallback');
        var body = document.getElementsByTagName('body')[0]
        body.innerHTML = ieBlock.outerHTML;
        ieBlock.style.display = 'inherit';
        body.className += ' ie';
        return false;
    }

    // App components (short ones, the others are in separate files)
    var GalleryComponent = {
        template: jQuery('#gallery-template').html(),
        data: function() {
            return { }
        },
        mounted: function()  { Gallery.go(); }
    };
    var ProjectsComponent = {
        template: jQuery('#projects-template').html(),
        data: function() {
            return { }
        },
        mounted: function() { Projects.go(); }
    };
    var VjingComponent = { template: jQuery('#vjing-template').html() };
    var ContactComponent = { template: jQuery('#contact-template').html() };
    var CVComponent = {
        template: jQuery('#cv-template').html(),
        data: function() {
            return { }
        },
        mounted: function() { CV.go(); }
    };

    // Custom components
    Vue.component('geom', {
        template: jQuery('#geom-template').html(),
        props: ['sides', 'header', 'rotate']
    });
    Vue.component('logo-links', {
        template: jQuery('#logo-links-template').html()
    });
    Vue.component('coming-soon', {
        template: jQuery('#coming-soon-template').html()
    });
    Vue.component('inline-svg-logo', {
        template: jQuery('#inline-svg-logo-template').html()
    });

    // App routes
    var routes = [
        { path: '/', component: HomeComponent },
        { path: '/gallery', component: GalleryComponent },
        { path: '/projects', component: ProjectsComponent },
        { path: '/animations', component: AnimationsComponent },
        { path: '/vjing', component: VjingComponent },
        { path: '/about', component: AboutComponent },
        { path: '/contact', component: ContactComponent },
        { path: '/cv', component: CVComponent },
        { path: '*', component: NotFoundComponent }
    ];

    // Build router
    var router = new VueRouter({
        routes: routes,
        mode: 'history'
    });

    // Scroll to top on route change
    router.beforeEach(function(to, from, next) {
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 100);
        next();
    });

    var app = new Vue({
        router: router,
        el: '#alexandrix-website',
        data: {
            isOpen: false,
            hueAngle: 0
        },
        methods: {
            rotateLeHue: function() {
                this.hueAngle = Math.round(360 * Math.random());
            }
        }
    });

});