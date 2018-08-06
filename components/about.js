var AboutComponent = {
    template: jQuery('#about-template').html(),
    data: function() {
        return {
            showRiddle: false,
            riddleAnswer: ""
        }
    },
    methods: {
        submitRiddle: function() {
            if (this.isAnswerValid(this.riddleAnswer)) {
                Global.router.push('/cv');
            } else {
                this.animateTryAgain();
            }
        },
        animateTryAgain: function() {
            var $error = jQuery('.riddle-input p.error');
            $error.animate({ opacity: 1 }, 500);
            setTimeout(function() {
                $error.animate({ opacity: 0 }, 1000);
            }, 3000);
        },
        isAnswerValid: function(answer) {
            var hasGold = answer.indexOf('gold') > -1 || answer.indexOf('Gold') > -1,
                hasValue = Math.round(10 * answer) / 10 == 1.6,
                hasCommaValue = answer.indexOf('1,6') > -1,
                hasPhi = answer.indexOf('phi') > -1 || answer.indexOf('Phi') > -1,
                hasRatio = answer.indexOf('ratio') > -1;

            return hasGold || hasValue || hasCommaValue || hasPhi || hasRatio;
        }
    },
    mounted: function() {
        // About link hover effects
        var logoMail = jQuery('#about a.mailme');
        var logoDeviant = jQuery('#about a.deviant');
        var logoGithub = jQuery('#about a.github');
        var logoCodepen = jQuery('#about a.codepen');
        jQuery('#about span.aboutmail').on({
            mouseenter: function() {
                logoMail.css('box-shadow', 'rgba(255,255,255,0.7) 0 0 15px');
            },
            mouseleave: function() {
                logoMail.css('box-shadow', '');// Empty string --> back to static style from .css file!
            }
        });
        jQuery('#about span.aboutdeviant').on({
            mouseenter: function() {
                logoDeviant.css('box-shadow', 'rgba(255,255,255,0.7) 0 0 15px');
            },
            mouseleave: function() {
                logoDeviant.css('box-shadow', '');
            }
        });
        jQuery('#about span.aboutgithub').on({
            mouseenter: function() {
                logoGithub.css('box-shadow', 'rgba(255,255,255,0.7) 0 0 15px');
            },
            mouseleave: function() {
                logoGithub.css('box-shadow', '');
            }
        });
        jQuery('#about span.aboutcodepen').on({
            mouseenter: function() {
                logoCodepen.css('box-shadow', 'rgba(255,255,255,0.7) 0 0 15px');
            },
            mouseleave: function() {
                logoCodepen.css('box-shadow', '');
            }
        });
    }
};