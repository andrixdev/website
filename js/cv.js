// Globals
let CV = {};

/**
 * Fills the DOM with cv.xml
 * @param {Function} extraCallback Function called after the DOM is filled
 */
CV.loadCV = (extraCallback) => {

	jQuery
	.get("cv.xml", {})
	.done(function(data) {
		
		var tempo = 0;
		var enable = 1;
		
		// 1 - Intro
		//// 1.1 - Header, fading in, staying for a while and then fading out
		////// Fade in (jQuery.fadeIn won't override CSS)
		jQuery('.cvcore .intro h5.moar').css('display', 'inherit').animate({
			opacity: 1
		}, 1000);
		////// Fade out
		tempo += 2000;
		setTimeout(function() {
			jQuery('.cvcore .intro h5.moar').animate({
				opacity: 0
			}, 2000, function() {
				// Remove from DOM
				jQuery('.cvcore .intro h5.moar').remove();
			});
		}, tempo * enable);
		
		//// 1.2 - Intro lines, one after the other
		tempo += 2000;// fadeOut time + 500ms
		jQuery('.cvcore .intro p').each(function() {
			////// Fade in
			tempo += 300;
			var self = this;
			setTimeout(function() {
				jQuery(self).css('display', 'inherit').animate({
					opacity: 1
				}, 2000);
			}, tempo * enable);
		});
		
		// 2 - Enjoy
		tempo += 2500;
		setTimeout(function() {
			jQuery('.cvcore .enjoy').css('display', 'inherit').animate({
				opacity: 1
			}, 1000);
		}, tempo * enable);
		
		// 3 - Abroad
		tempo += 2000;
		setTimeout(function() {
			jQuery('.cvcore .abroad').css('display', 'inherit').animate({
				opacity: 1
			}, 1000);
		}, tempo * enable);
		
		// 4 - Schools
		tempo += 4000;
		setTimeout(function() {
			jQuery('.cvcore .schools').css('display', 'inherit').animate({
				opacity: 1
			}, 1000);
		}, tempo * enable);
		
		// 5 - Webskills
		tempo += 1500;
		setTimeout(function() {
			jQuery('.cvcore .webskills').css('display', 'inherit').animate({
				opacity: 1
			}, 1000);
		}, tempo * enable);
		
		// 6 - CV title
		tempo += 5000;
		setTimeout(function() {
			jQuery('.cvcore .cake').css('display', 'flex').animate({
				opacity: 1
			}, 1000);
		}, tempo * enable);
		
		// 7 - CV slices (from XHR) one after the other
		tempo += 0;
		jQuery(data).find('slice').each(function() {
		
			tempo += 700;
			
			var sliceHTML = "";
			var title = jQuery(this).find('title').text();
			var institution = jQuery(this).find('institution').text();
			var place = jQuery(this).find('place').text();
			var when = jQuery(this).find('when').text();
			var year = jQuery(this).find('year').text();
			var what = jQuery(this).find('what').text();
			var skill = jQuery(this).find('skill').text();
			
			sliceHTML += "<div class='slice'>";
			sliceHTML +=   "<div class='left-side'>";
			sliceHTML +=     "<p class='year'>" + year + "</p>";
			sliceHTML +=     "<p class='skill'>" + skill + "</p>";
			sliceHTML +=   "</div>";
			sliceHTML +=   "<div class='right-side'>";
			sliceHTML +=     "<h5>" + title + "</h5>";
			var sliceBit = institution;
			sliceBit += (place !== "" && when !== "" ? " - " + place + " (" + when + ")" : "");
			sliceHTML +=     "<p class='institution'>" + sliceBit + "</p>";
			sliceHTML +=     "<p class='what'>" + what + "</p>";
			sliceHTML +=   "</div>";
			sliceHTML += "</div>";
			
			setTimeout(function() {
				// DOM fill
				jQuery('.cvcore .cake').append(sliceHTML);
				// Fade in
				jQuery('.cvcore .slice').last().css('display', 'flex').animate({
					opacity: 1
				}, 1000);
			}, tempo * enable);
			
		});
		
		// 8 - Recommendations
		tempo += 4000;
		setTimeout(function() {
			jQuery('.cvcore .recom').css('display', 'inherit').animate({
				opacity: 1
			}, 1000);
		}, tempo * enable);
		
		extraCallback();
	});
};

/**
 * Submit handler to the form showing CV
 */
CV.keyCheckForCV = () => {
	jQuery("form.showcv").submit(function(event) {

		// Stop form from submitting normally
		event.preventDefault();
		// Now we're talking.
		
		// Define regex for key validation. Yeah that's where you can hack into my code to see my CV, derp.
		// Actually no, regex suck.
		var input = jQuery('#cv .password input').val();
		var shallPass = (input.charAt(input.length - 1) == 3);
		
		// Loading icon start
		var randomTimeout = 500 + 500 * Math.random();
		var jShow = jQuery('#cv .show');
		var button = "<input type='submit' value='Show CV'>";
		var loadDiv = "<div class='load'></div>";
		
		// Loading icon will start to whirl in both cases
		jShow.html(loadDiv);
		
		if (shallPass) {
			// Loading
			// Artificially boost timeout
			randomTimeout += 1000;
			setTimeout(function() {
				// Empty DOM nodes for password entering
				jQuery('form.showcv, p#invalid').fadeOut(500, function() {
					// Fill DOM with CV
					loadCV();
				});
				
			}, randomTimeout);
		} else {
			setTimeout(function() {
				// Restore form button
				jShow.html(button);
				
				// Feedback message of invalid key
				invalidKeyAnimation();
				
			}, randomTimeout);
		}
	});
};

/**
 * Submit handler to the form showing CV, without any password
 */
CV.showCVwithoutKey = () => {
	jQuery("form.showcv").submit(function(event) {

		// Stop form from submitting normally
		event.preventDefault();
		// Now we're talking.
		
		// Loading icon start
		var randomTimeout = 500 + 500 * Math.random();
		var jShow = jQuery('#cv .show');
		var button = "<input type='submit' value='Show CV'>";
		var loadDiv = "<div class='load'></div>";
		
		// Loading icon will start to whirl in both cases
		jShow.html(loadDiv);
		
		// Loading
		setTimeout(function() {
			// Empty DOM nodes for CV show (here, button only)
			jQuery('form.showcv').fadeOut(500, function() {
				// Fill DOM with CV
				loadCV();
			});
		}, randomTimeout);
	});
};

/**
 * User feedback that the entered key is wrong
 */
CV.invalidKeyAnimation = () => {
	// Insert feedback
	jQuery('form.showcv').after("<p id='invalid'>Invalid key, please try again.</p>");
	
	// Remove feedback after a while
	setTimeout(function() {
		// Fade out
		jQuery('p#invalid').fadeOut(3000, function() {
			// Then take out
			jQuery(this).remove();
		});
	}, 1500);
	
};

/**
 * Initializer
 */
CV.go = () => {
    CV.loadCV(() => {
		Projects.showCVwithoutKey();
	});
};
