document.addEventListener('DOMContentLoaded', () => {

    // App views
    const HomeComponent = {
        template: jQuery('#home-template').html(),
        props: [ 'bouse' ],
        data: () => {
            return {
                stuff: [
                    { ew: 'yeah'},
                    { ew: 'yeah'}
                ]
            }
        },
        mounted: () => {

        }

    };
    const GalleryComponent = {
        template: jQuery('#gallery-template').html(),
        data: () => {
            return { }
        },
        mounted: () => { Gallery.go(); }
    };
    const ProjectsComponent = {
            template: jQuery('#projects-template').html(),
            data: () => {
            return { }
        },
        mounted: () => { Projects.go(); }
    };
    const AnimationsComponent = { template: jQuery('#animations-template').html() };
    const VjingComponent = { template: jQuery('#vjing-template').html() };
    const AboutComponent = { template: jQuery('#about-template').html() };
    const ContactComponent = { template: jQuery('#contact-template').html() };
    const CVComponent = {
        template: jQuery('#cv-template').html(),
        data: () => {
            return { }
        },
        mounted: () => { CV.go(); }
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

    // App routes
    const routes = [
        { path: '/', component: HomeComponent },
        { path: '/gallery', component: GalleryComponent },
        { path: '/projects', component: ProjectsComponent },
        { path: '/animations', component: AnimationsComponent },
        { path: '/vjing', component: VjingComponent },
        { path: '/about', component: AboutComponent },
        { path: '/contact', component: ContactComponent },
        { path: '/cv', component: CVComponent },
    ];

    // Build router
    const router = new VueRouter({
        routes // short for `routes: routes`
    });

    const app = new Vue({
        router,
        el: '#icosacid-website',
        data: () => {
            return {
                isOpen: false,
                home: {
                    gallery: [
                        { path: 'img/misc/seadra.png' }
                    ],
                    projects: [
                        { path: 'img/misc/horsea.png' }
                    ],
                    animations: [

                    ],
                    vjing: [

                    ]
                },
                bouse: ['bouzinit']
            }
        },
        computed: () => {
            return {
                bouse: ['caca tableau']
            };
        },
        mounted: () => {
            console.dir('MainMouted!!!');

            console.log('this.bouse');
            console.log(this);

            this.bouse = ['caca de qualité'];
            /*
            jQuery
                .get("algories.xml", {})
                .done((data) => {

                    let paths = [];

                    let jAlgories = jQuery(data).find('algories');
                    jAlgories.find('category').each(function() {
                        jQuery(this).find('alg').each(function() {
                            let src = "img/" + jQuery(this).find('src').text();
                            paths.push({ path: src });
                        });
                    });

                    self.set(this.gallery, paths, true);
                });*/
        }
    });

});