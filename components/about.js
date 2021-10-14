var AboutComponent = {
    template: jQuery('#about-template').html(),
    data: function () {
        return { }
    },
    methods: {
        activateBioQuanticGlitch: function () {
            // Prepare empty arrays with texts
            var paragraphs = jQuery('.longer-bio > p').length;
            var htmlContents = []; // Raw initial text including <em>s
            var textContents = []; // Raw initial text
            var textArrays = []; // Splitted initial text
            var newArrays = []; // Shuffled text

            // Fill with text
            for (var l = 0; l < paragraphs; l++) {
                var htmlContent = jQuery('.longer-bio > p:nth-of-type(' + (l - (-1)) + ')').html();
                var textContent = jQuery('.longer-bio > p:nth-of-type(' + (l - (-1)) + ')').text();
                var textArray = textContent.split(' ');
                var newArray = textArray.slice(0);

                htmlContents.push(htmlContent);
                textContents.push(textContent);
                textArrays.push(textArray);
                newArrays.push(newArray);
            }

            // Listeners
            jQuery('.longer-bio > p').each(function (i, e) {

                jQuery(this).off().on('mousemove', function () {
                    var newArray = newArrays[i];

                    // Shuffle 2 words in new array
                    var len = newArray.length;
                    var randomIndex1 = Math.floor(len * Math.random());
                    var randomIndex2 = Math.floor(len * Math.random());
                    var buffer = newArray[randomIndex1];
                    newArray[randomIndex1] = newArray[randomIndex2];
                    newArray[randomIndex2] = buffer;

                    // Build word outta array and print out
                    var newText = "";
                    for (var j = 0; j < len; j++) {
                        var rand = Math.random() < 0.1;
                        if (rand) newText += "<em>";
                        newText += newArray[j] + " ";
                        if (rand) newText += "</em>";
                    }
                    jQuery(this).html(newText);
                }).on('mouseout', function () {
                    // Reset text
                    jQuery(this).html(htmlContents[i]);

                    // Start shuffling anew on each hoverin
                    newArrays[i] = textArrays[i].slice(0);
                });

            });
        }
    },
    mounted: function () {

        jQuery('.longer-bio').hide();

        jQuery('.load-longer-bio').on('click', function () {
            jQuery('.longer-bio').show();
            jQuery('.showmore-toggle-bar.load-longer-bio').hide();
        });

        this.activateBioQuanticGlitch();

        // Show past events
        jQuery('.past-events').hide();
        jQuery('.load-past-events').on('click', function () {
            jQuery('.past-events').show();
            jQuery('.showmore-toggle-bar.load-past-events').hide();
        });
    }
};