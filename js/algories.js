/**
 * JS for icosacid.com
 *
 * @author Alexandre Andrieux <alex@icosacid.com>
 * @since 2015-03
 *
 * Changes in algories.js shall be duplicated in pro.js
 * JS files on respective pages are independent
 */

// Globals
var algData = [];
var menuIsSqueezed = false;
var mouseIsOverHead = false;
var mouseIsOverFront = false;
var logoAngle = 0;

/**
 * Fills the DOM with algories.xml
 * @param {Function} extraCallback Function called after the DOM is filled
 */
function loadAlgories(extraCallback) {
	var gallery = jQuery('#whole');
	jQuery
	.get("algories.xml", {})
	.done(function(data) {
	
		var jAlgories = jQuery(data).find('algories');
		jAlgories.find('category').each(function() {
			var categHTML = "";
			
			// Get the name!
			var categName = jQuery(this).find('categoryName').text();
			categHTML += "<div class='categ'>";
			categHTML += "<h3 class='categname'>" + categName + "</h3>";
			
			// Get the Morons!
			var morons = jQuery(this).find('categMoreOnLinks');
			var moronCodepen = morons.find('codepen').text();
			var moronDeviantart = morons.find('deviantart').text();
			categHTML += "<div class='moron'>";
			categHTML += "<p>More on</p>";
			categHTML += "<a class='fa fa-codepen' href='" + moronCodepen + "' title='See the live collection on CodePen' target='_blank'></a>";
			categHTML += "<a class='fa fa-deviantart' href='" + moronDeviantart + "' title='See the gallery on DeviantArt' target='_blank'></a>";
			categHTML += "</div>";
			
			// Create categ object
			var categObj = {
				categName: categName,
				alg: []
			};
			
			jQuery(this).find('alg').each(function() {
				var title = jQuery(this).find('title').text();
				var src = "img/" + jQuery(this).find('src').text();
				var small = "img/" + jQuery(this).find('small').text();
				var description = jQuery(this).find('description').text();
				var deviant = jQuery(this).find('deviant').text();
				var github = jQuery(this).find('github').text();
				var id = jQuery(this).find('artid').text();
				
				// Fill the DOM
				categHTML += "<div class='alg' id='art-id-" + id + "' >";
				
				categHTML += "<img src='" + small + "' alt ='" + title + "'/>";
				categHTML += "<h4 class='title'>" + title + "</h4>";
				// No deviant or github in the DOM at the moment
				categHTML += "</div>";
				
				// Fill the categ object
				categObj.alg.push({
					id: id,
					title: title,
					src: src,
					small: small,
					description: description,
					deviant: deviant,
					github: github
				});
				
			});
			
			categHTML += "</div>";
			
			gallery.append(categHTML);
			// Feed global data with categ object
			algData.push(categObj);
		});
		
		extraCallback();
	});
}

/**
 * Assuming the global array algData is filled
 * @param {Number} id ID of algory
 * @returns {Object} Algory object
 */
function getAlg(id) {
	for (key in algData) {
		for (key2 in algData[key].alg) {
			if ('art-id-' + algData[key].alg[key2].id == id) {
				return algData[key].alg[key2];
			}
		}
	}
	console.log('Nothing found with ID ' + id);
}

/**
 * Listeners on each algory
 */
function DOMlisteners() {
	// Algories blocks
	jQuery('.alg').on({
		mouseenter: function() {
			jQuery(this).find('h4.title').css('opacity','1');
			jQuery(this).css('box-shadow','rgba(255,255,255,0.5) 0px 0px 10px');
		}, mouseleave: function() {
			jQuery(this).find('h4.title').css('opacity','0');
			jQuery(this).css('box-shadow','none');
		}, mouseup: function() {
			showFront();
			fillFront(jQuery(this));
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
 * Listeners for front view
 */
function frontListeners() {
	jQuery('#front .zoom').on({
		mouseenter: function() {
			mouseIsOverFront = true;
			showFrontDetails();
		}, mouseleave: function() {
			mouseIsOverFront = false;
			hideFrontDetails();
		}
	});
	jQuery('#front').on({
		mouseup: function() {
			if (!mouseIsOverFront) {
				hideFront();
			}
		}
	});
	jQuery('#front .zoom .quit').on({
		mouseup: function() {
			hideFront();
		}
	});
}

/**
 * DOM filler called on demand (click on an algory)
 */
function fillFront(jAlgNode) {
	
	loadingOn();
	
	var id = jAlgNode.attr('id');
	var src = getAlg(id).src;
	var title = getAlg(id).title;
	var description = getAlg(id).description;
	var deviant = getAlg(id).deviant;
	var github = getAlg(id).github;
	
	// Image
	var newImg = new Image();
	newImg.onload = function() {
		var self = this;
		
		var height = this.height;
		var width = this.width;
		
		// If image is bigger than 0.9*window, rescale
		var ratioW = this.width / (0.9*jQuery(window).width());
		var ratioH = this.height / (0.9*jQuery(window).height());
		var ratio = Math.max(ratioH, ratioW);
		if (ratio > 1 && ratioW > ratioH) {
			height /= ratioW;
			width /= ratioW;
		} else if (ratio > 1 && ratioH > ratioW) {
			height /= ratioH;
			width /= ratioH;
		}
		
		var left = (jQuery(window).width() - width)/2;
		var top = (jQuery(window).height() - height)/2;
		
		jQuery('#front .zoom').css('height', height).css('width', width).css('top', top).css('left', left);
		setTimeout(function() {
			loadingOff();
			jQuery('#front .zoom .fullimg img').attr('src', self.src);
		}, 500);
	}
	newImg.src = src;
	newImg.alt = title;
	
	// Description
	jQuery('#front .zoom .details .description p.title').html(title);
	jQuery('#front .zoom .details .description p.text').html(description);
	
	// Social stuff
	jQuery('#front .zoom .details .social .deviant').html(deviant);
	jQuery('#front .zoom .details .social .github').html(github);
}

/**
 * Shows front view
 */
function showFront() {
	jQuery('#front').css('display','inherit').animate({
		opacity: 1
	}, 1000);
}

/**
 * Hides front view
 */
function hideFront() {
	jQuery('#front').animate({
		opacity: 0
	}, 500, function() {
		jQuery(this).css('display','none');
	});
}

/**
 * Shows details in front view
 */
function showFrontDetails() {
	jQuery('#front .zoom .details').css('opacity', 1);
}

/**
 * Hides details in front view
 */
function hideFrontDetails() {
	jQuery('#front .zoom .details').css('opacity', 0);
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
	jQuery('#head .menu .algories').stop(true).animate({
		'marginLeft': '-200px'
	}, 500, function() {
		jQuery('#head .menu').css('display', 'none');
	});
	rotateLogo(120);
}

/**
 * Expands navigation menu: displays tabs
 */
function expandMenu() {
	jQuery('#head .menu').css('display', '').find('.algories').stop(true).animate({
		'marginLeft': '0px'
	}, 500);
	rotateLogo(120);
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
 * Loading icon within front view - Turn on
 */
function loadingOn() {
	jQuery('.zoom .loader').show();
}

/**
 * Loading icon within front view - Turn off
 */
function loadingOff() {
	jQuery('.zoom .loader').hide();
}

/**
 * Initializer
 */
jQuery(document).ready(function() {
	loadAlgories(function() {
		DOMlisteners();
		headListeners();
		scrollListener();
		frontListeners();
	});
});

