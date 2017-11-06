/**
 * JS for icosacid.com/pro
 *
 * @author Alexandre Andrieux <alex@icosacid.com>
 * @since 2015-03
 *
 * Changes in algories.js shall be duplicated in pro.js
 * JS files on respective pages are independent
 */

// Globals
var menuIsSqueezed = false;
var menuIsDoingSomething = false;
var mouseIsOverHead = false;
var logoAngle = 0;
//var isMobile defined in index.php

/**
 * Fills the DOM with xmlprojects.xml
 * @param {Function} extraCallback Function called after the DOM is filled
 */
function loadProjects(extraCallback) {
	jQuery
	.get("xmlprojects.xml", {})
	.done(function(data) {
	
		var jProjects = jQuery(data).find('projects');
		
		jProjects.find('project').each(function(index) {
			
			// Get XML content
			var projectHTML = "";
			var title = jQuery(this).find('title').text();
			var description = jQuery(this).find('description').text();
			var src = jQuery(this).find('image').text();
			var link = jQuery(this).find('link').text();
			
			// Create HTML
			projectHTML += "<div class='project'>";
			projectHTML +=   "<div class='left'>";
			projectHTML +=     "<img src='" + src + "' title='" + title + "' alt='" + title + "' />";
			projectHTML +=   "</div>";
			projectHTML +=   "<div class='right'>";
			projectHTML +=     "<h4>" + title + "</h4>";
			projectHTML +=     "<p>" + description + "</p>";
			projectHTML +=     "<a href='" + link + "' target='_blank' alt ='" + title + "' />";
			projectHTML +=   "</div>";
			projectHTML += "</div>";
			
			// Spread in the DOM
			jQuery('#projects .show').before(projectHTML);
			
		});
		
		var firstglance = 6;
		jQuery('#projects .project').each(function(index) {
			if (index >= firstglance) {
				jQuery(this).addClass('hidden');
			}
		});
		
		extraCallback();
	});
}

/**
 * Fills the DOM with xmlcv.xml
 * @param {Function} extraCallback Function called after the DOM is filled
 */
function loadCV(extraCallback) {

	jQuery
	.get("xmlcv.xml", {})
	.done(function(data) {
		
		var tempo = 0;
		var enable = 1;
		
		// 1 - Intro
		//// 1.1 - Header, fading in, staying for a while and then fading out
		////// Fade in (jQuery.fadeIn won't override CSS)
		jQuery('#cvcore .intro h5.moar').css('display', 'inherit').animate({
			opacity: 1
		}, 1000);
		////// Fade out
		tempo += 2000;
		setTimeout(function() {
			jQuery('#cvcore .intro h5.moar').animate({
				opacity: 0
			}, 2000, function() {
				// Remove from DOM
				jQuery('#cvcore .intro h5.moar').remove();
			});
		}, tempo * enable);
		
		//// 1.2 - Intro lines, one after the other
		tempo += 2000;// fadeOut time + 500ms
		jQuery('#cvcore .intro p').each(function() {
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
			jQuery('#cvcore .enjoy').css('display', 'inherit').animate({
				opacity: 1
			}, 1000);
		}, tempo * enable);
		
		// 3 - Abroad
		tempo += 2000;
		setTimeout(function() {
			jQuery('#cvcore .abroad').css('display', 'inherit').animate({
				opacity: 1
			}, 1000);
		}, tempo * enable);
		
		// 4 - Schools
		tempo += 4000;
		setTimeout(function() {
			jQuery('#cvcore .schools').css('display', 'inherit').animate({
				opacity: 1
			}, 1000);
		}, tempo * enable);
		
		// 5 - Webskills
		tempo += 1500;
		setTimeout(function() {
			jQuery('#cvcore .webskills').css('display', 'inherit').animate({
				opacity: 1
			}, 1000);
		}, tempo * enable);
		
		// 6 - CV title
		tempo += 5000;
		setTimeout(function() {
			jQuery('#cvcore .cake').css('display', 'flex').animate({
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
			sliceHTML +=   "<div class='left'>";
			sliceHTML +=     "<p class='year'>" + year + "</p>";
			sliceHTML +=     "<p class='skill'>" + skill + "</p>";
			sliceHTML +=   "</div>";
			sliceHTML +=   "<div class='right'>";
			sliceHTML +=     "<h5>" + title + "</h5>";
			var sliceBit = institution;
			sliceBit += (place !== "" && when !== "" ? " - " + place + " (" + when + ")" : "");
			sliceHTML +=     "<p class='institution'>" + sliceBit + "</p>";
			sliceHTML +=     "<p class='what'>" + what + "</p>";
			sliceHTML +=   "</div>";
			sliceHTML += "</div>";
			
			setTimeout(function() {
				// DOM fill
				jQuery('#cvcore .cake').append(sliceHTML);
				// Fade in
				jQuery('#cvcore .slice').last().css('display', 'flex').animate({
					opacity: 1
				}, 1000);
			}, tempo * enable);
			
		});
		
		// 8 - Recommendations
		tempo += 4000;
		setTimeout(function() {
			jQuery('#cvcore .recom').css('display', 'inherit').animate({
				opacity: 1
			}, 1000);
		}, tempo * enable);
		
		extraCallback();
	});
}

/**
 * Submit handler to the form showing CV
 */
function keyCheckForCV() {
	jQuery("form#showcv").submit(function(event) {

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
		spreadSVG('#cv .show .load', 7, [1]);
		
		if (shallPass) {
			// Loading
			// Artificially boost timeout
			randomTimeout += 1000;
			setTimeout(function() {
				// Empty DOM nodes for password entering
				jQuery('form#showcv, p#invalid').fadeOut(500, function() {
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
}

/**
 * Submit handler to the form showing CV, without any password
 */
function showCVwithoutKey() {
	jQuery("form#showcv").submit(function(event) {

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
		spreadSVG('#cv .show .load', 7, [1]);
		
		// Loading
		setTimeout(function() {
			// Empty DOM nodes for CV show (here, button only)
			jQuery('form#showcv').fadeOut(500, function() {
				// Fill DOM with CV
				loadCV();
			});
		}, randomTimeout);
	});
}

/**
 * User feedback that the entered key is wrong
 */
function invalidKeyAnimation() {
	// Insert feedback
	jQuery('form#showcv').after("<p id='invalid'>Invalid key, please try again.</p>");
	
	// Remove feedback after a while
	setTimeout(function() {
		// Fade out
		jQuery('p#invalid').fadeOut(3000, function() {
			// Then take out
			jQuery(this).remove();
		});
	}, 1500);
	
}

/**
 * Listeners on each project
 * ------ COMING: ON CV FORM -------
 */
function DOMlisteners() {

	// Project links
	jQuery('.project').on({
		mouseenter: function() {
			
		}, mouseleave: function() {
			
		}, mouseup: function() {
			var goToLink = jQuery(this).find('a').attr('href');
			window.open(goToLink, '_blank');
		}
	});
			
	// Projects show more button
	jQuery('#projects .show').on({
		mouseup: function() {
		
			var remain = jQuery('#projects .project.hidden').length;
			var unveil = 4;
			
			jQuery('#projects .project.hidden').each(function(index) {
				// Unveil the next projects
				if (index < unveil) {
					jQuery(this).removeClass('hidden');
				}
			});
			
			// Hide button if not necessary anymore
			if (remain <= unveil) {
				jQuery('#projects .show').css('display', 'none');
			}
		}
	});
	
	// About link hover effects
	var logoMail = jQuery('#about a.mailme');
	var logoDeviant = jQuery('#about a.deviant');
	var logoGithub = jQuery('#about a.github');
	var logoCodepen = jQuery('#about a.codepen');
	jQuery('#about span.aboutmail').on({
		mouseenter: function() {
			logoMail.css('box-shadow', 'rgba(255,255,255,0.7) 0px 0px 15px');
		},
		mouseleave: function() {
			logoMail.css('box-shadow', '');// Empty string --> back to static style from .css file!
		}
	});
	jQuery('#about span.aboutdeviant').on({
		mouseenter: function() {
			logoDeviant.css('box-shadow', 'rgba(255,255,255,0.7) 0px 0px 15px');
		},
		mouseleave: function() {
			logoDeviant.css('box-shadow', '');
		}
	});
	jQuery('#about span.aboutgithub').on({
		mouseenter: function() {
			logoGithub.css('box-shadow', 'rgba(255,255,255,0.7) 0px 0px 15px');
		},
		mouseleave: function() {
			logoGithub.css('box-shadow', '');
		}
	});
	jQuery('#about span.aboutcodepen').on({
		mouseenter: function() {
			logoCodepen.css('box-shadow', 'rgba(255,255,255,0.7) 0px 0px 15px');
		},
		mouseleave: function() {
			logoCodepen.css('box-shadow', '');
		}
	});
}

/** 
 * Listeners for navigation menu mechanics and tab clicks
 */
function headListeners() {
	jQuery('#head').on({
		mouseenter: function() {
			mouseIsOverHead = true;
		}, mouseleave: function() {
			if (!menuIsSqueezed && jQuery(window).scrollTop() !== 0) {
				squeezeMenu();
				menuIsSqueezed = true;
			}
			mouseIsOverHead = false;
		}
	});
	jQuery('#head .logo').on({
		mouseenter: function() {
			if (menuIsSqueezed) {
				expandMenu();
				menuIsSqueezed = false;
			}
		}, mouseleave: function() {
			if (!menuIsSqueezed && jQuery(window).scrollTop() !== 0 && !mouseIsOverHead) {
				squeezeMenu();
				menuIsSqueezed = true;
			}
		}
	});
	jQuery('#head .menu .algories p').on({
		mouseup: function() {
			jQuery('html, body').animate({
				scrollTop: 0
			}, 1000);
		}
	});
	jQuery('#head .menu .about p').on({
		mouseup: function() {
			jQuery('html, body').animate({
				scrollTop: jQuery('#cv').offset().top
			}, 1000);
		}
	});
	jQuery('#head .menu .contact p').on({
		mouseup: function() {
			jQuery('html, body').animate({
				scrollTop: jQuery('#about').offset().top
			}, 1000);
		}
	});
}

/**
 * Listener to expand menu when the page is totally scrolled up (not screwed up!)
 */
function scrollListener() {
	jQuery(window).scroll(function() { 
		if (jQuery(window).scrollTop() == 0 && menuIsSqueezed) {
			expandMenu();
			menuIsSqueezed = false;
		} else if (jQuery(window).scrollTop() == 0 && !menuIsSqueezed) {
			// Well, that's a good thing
		} else if (!menuIsSqueezed) {
			squeezeMenu();
			menuIsSqueezed = true;
		}
		else {
			// Leave menu squeezed
		}
	});
}

/**
 * Squeezes navigation menu: hides tabs
 */
function squeezeMenu() {
	if (!isMobile) {
		jQuery('#head .menu .algories').stop(true).animate({
			'marginLeft': '-200px'
		}, 500, function() {
			jQuery('#head .menu').css('display', 'none');
		});
		rotateLogo(120);
	}
}

/**
 * Expands navigation menu: displays tabs
 */
function expandMenu() {
	if (!isMobile) {
		jQuery('#head .menu').css('display', '').find('.algories').stop(true).animate({
			'marginLeft': '0px'
		}, 500);
		rotateLogo(120);
	}
}

/**
 * Rotates top left logo
 * Uses global var logoAngle
 * @param {Number} angleDeg Added angle in degrees
 */
function rotateLogo(angleDeg) {
	jQuery('#head .logo svg').css('transform','rotate(' + parseInt(logoAngle + angleDeg) + 'deg)');
	logoAngle += angleDeg;
}

/**
 * Initializer
 */
jQuery(document).ready(function() {
	loadProjects(function() {
		DOMlisteners();
		headListeners();
		scrollListener();
		//keyCheckForCV();
		showCVwithoutKey();
	});
	// Logo spreads
	spreadSVG('#head .logo', 7, [1]);
});

