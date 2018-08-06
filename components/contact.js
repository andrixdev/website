var ContactComponent = {
    template: jQuery('#contact-template').html(),
    data: function() {
        return { }
    },
    mounted: function() {
        // Link hover effects
        var logoMail = jQuery('#contact a.mailme');
        var logoDeviant = jQuery('#contact a.deviant');
        var logoGithub = jQuery('#contact a.github');
        var logoCodepen = jQuery('#contact a.codepen');
        jQuery('#contact span.aboutmail').on({
            mouseenter: function() {
                logoMail.css('text-shadow', 'rgba(255, 255, 255, 0.85) 0 0 50px');
            },
            mouseleave: function() {
                logoMail.css('text-shadow', '');// Empty string --> back to static style from .css file!
            }
        });
        jQuery('#contact span.aboutdeviant').on({
            mouseenter: function() {
                logoDeviant.css('text-shadow', 'rgba(255, 255, 255, 0.85) 0 0 50px');
            },
            mouseleave: function() {
                logoDeviant.css('text-shadow', '');
            }
        });
        jQuery('#contact span.aboutgithub').on({
            mouseenter: function() {
                logoGithub.css('text-shadow', 'rgba(255, 255, 255, 0.85) 0 0 50px');
            },
            mouseleave: function() {
                logoGithub.css('text-shadow', '');
            }
        });
        jQuery('#contact span.aboutcodepen').on({
            mouseenter: function() {
                logoCodepen.css('text-shadow', 'rgba(255, 255, 255, 0.85) 0 0 50px');
            },
            mouseleave: function() {
                logoCodepen.css('text-shadow', '');
            }
        });
    }
};