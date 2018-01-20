document.addEventListener('DOMContentLoaded', () => {

    // App views
    const HomeComponent = {
        template: jQuery('#home-template').html(),
        data: () => {
            return {
                exercises: [
                    {
                        sourceLink: 'http://ravenkwok.com/1194d/',
                        description: 'Spaces and non-spaces working as anti-volumes arranged in a ordrered manner',
                        sourceImageLink: 'http://farm6.staticflickr.com/5467/9809073965_52e39099fa_z.jpg',
                        responsePaths: [
                            'ex-0-jeanf.jpg',
                            'ex-0-yngvesin.gif',
                            'ex-0-icosacid.png'
                        ]
                    }
                ]
            }
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
        data: {
            isOpen: false
        }
    });//.$mount('#melting-app')

});