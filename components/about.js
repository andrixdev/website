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
                router.push('/cv');
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
    }
};