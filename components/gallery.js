/**
 * Being re-coded...
 */

var Gallery = {
	algData: [],
	mouseIsOverFront: false,
	isFrontShown: false,
	shouldShowFront: false,
	timeout: undefined
};

/**
 * Fills the DOM with algories.xml
 * @param {Function} extraCallback Function called after the DOM is filled
 */
Gallery.loadAlgories = function(extraCallback) {
	var gallery = jQuery('.gallery-content');
	jQuery
	.get("data/algories.xml", {})
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
			if (morons.length) {
                categHTML += "<div class='moron'>";
                categHTML += "<p>More on</p>";
                categHTML += "<a class='fa fa-codepen' href='" + moronCodepen + "' title='See the live collection on CodePen' target='_blank'></a>";
                categHTML += "<a class='fa fa-deviantart' href='" + moronDeviantart + "' title='See the animations on DeviantArt' target='_blank'></a>";
                categHTML += "</div>";
			}
			
			// Create categ object
			var categObj = {
				categName: categName,
				alg: []
			};

			categHTML += "<div class='categ-content'>";
			
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
			
			categHTML += "</div></div>";
			
			gallery.append(categHTML);
			// Feed global data with categ object
			Gallery.algData.push(categObj);
		});
		
		extraCallback();
	});
};

/**
 * Assuming the global array algData is filled
 * @param {Number} id ID of algory
 * @returns {Object} Algory object
 */
Gallery.getAlg = function(id) {
	for (key in Gallery.algData) {
		for (key2 in Gallery.algData[key].alg) {
			if ('art-id-' + Gallery.algData[key].alg[key2].id == id) {
				return Gallery.algData[key].alg[key2];
			}
		}
	}
	console.log('Nothing found with ID ' + id);
	return false;
};

/**
 * Listeners on each algory
 */
Gallery.DOMlisteners = function() {
	// Algories blocks
	jQuery('.alg').off().on({
		mouseenter: function() {
			jQuery(this).find('h4.title').css('opacity','1');
			jQuery(this).css('box-shadow','rgba(255,255,255,0.5) 0 0 10px');
		}, mouseleave: function() {
			jQuery(this).find('h4.title').css('opacity','0');
			jQuery(this).css('box-shadow','none');
		}, mouseup: function() {
			//Gallery.fillFront(jQuery(this).attr('id'));
			//Gallery.showFront();
			// Update route history
			Global.router.push({
				path: 'gallery', query: { artwork: jQuery(this).attr('id') }
			});
			//Gallery.fillFront(jQuery(this).attr('id'));
			//Gallery.showFront();
		}
	});
	
	// About link hover effects
	var logoMail = jQuery('#about a.mailme');
	var logoDeviant = jQuery('#about a.deviant');
	var logoGithub = jQuery('#about a.github');
	var logoCodepen = jQuery('#about a.codepen');
	jQuery('#about span.aboutmail').off().on({
		mouseenter: function() {
			logoMail.css('box-shadow', 'rgba(255,255,255,0.7) 0 0 15px');
		},
		mouseleave: function() {
			logoMail.css('box-shadow', '');// Empty string --> back to static style from .css file!
		}
	});
	jQuery('#about span.aboutdeviant').off().on({
		mouseenter: function() {
			logoDeviant.css('box-shadow', 'rgba(255,255,255,0.7) 0 0 15px');
		},
		mouseleave: function() {
			logoDeviant.css('box-shadow', '');
		}
	});
	jQuery('#about span.aboutgithub').off().on({
		mouseenter: function() {
			logoGithub.css('box-shadow', 'rgba(255,255,255,0.7) 0 0 15px');
		},
		mouseleave: function() {
			logoGithub.css('box-shadow', '');
		}
	});
	jQuery('#about span.aboutcodepen').off().on({
		mouseenter: function() {
			logoCodepen.css('box-shadow', 'rgba(255,255,255,0.7) 0 0 15px');
		},
		mouseleave: function() {
			logoCodepen.css('box-shadow', '');
		}
	});
};

/**
 * Listeners for front view
 */
Gallery.frontListeners = function() {
	jQuery('#front .zoom').off().on({
		mouseenter: function() {
            Gallery.mouseIsOverFront = true;
			Gallery.showFrontDetails();
		}, mouseleave: function() {
            Gallery.mouseIsOverFront = false;
            Gallery.hideFrontDetails();
		}
	});
	jQuery('#front').off().on({
		mouseup: function() {
			if (Gallery.isFrontShown && !Gallery.mouseIsOverFront) {
				Global.router.push({
					path: 'gallery', query: { artwork: 0 }
				});
			}
		}
	});
	jQuery('#front .zoom .quit').off().on({
		mouseup: function() {
			Global.router.push({
				path: 'gallery', query: { artwork: 0 }
			});
		}
	});
};

/**
 * DOM filler called on demand (click on an algory)
 */
Gallery.fillFront = function(id) {

	var alg = Gallery.getAlg(id);
	if (!alg) return false;

	Gallery.loadingOn();
	// Clear previous img
    jQuery('#front .zoom .fullimg img').attr('src', '');

	var src = alg.src;
	var title = alg.title;
	var description = alg.description;
	var deviant = alg.deviant;
	var github = alg.github;
	
	// Image
	var newImg = new Image();
	newImg.onload = function() {
		jQuery('#front .zoom .fullimg img').attr('src', '');
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

		// Fake timeout
		clearTimeout(Gallery.timeout);
		Gallery.timeout = setTimeout(function() {
            Gallery.loadingOff();
			jQuery('#front .zoom .fullimg img').attr('src', self.src);
		}, 500);
	};
	newImg.src = src;
	newImg.alt = title;
	
	// Description
	jQuery('#front .zoom .details .description p.title').html(title);
	jQuery('#front .zoom .details .description p.text').html(description);
	
	// Social stuff
	jQuery('#front .zoom .details .social .deviant').html(deviant);
	jQuery('#front .zoom .details .social .github').html(github);

	return true;
};

/**
 * Shows front view
 */
Gallery.showFront = function() {
	Gallery.isFrontShown = true;

	jQuery('#front').css('display', 'inherit');

};

/**
 * Hides front view
 */
Gallery.hideFront = function() {
	Gallery.isFrontShown = false;

	jQuery('#front').css('display', 'none');
};

/**
 * Shows details in front view
 */
Gallery.showFrontDetails = function() {
	jQuery('#front .zoom .details').css('opacity', 1);
};

/**
 * Hides details in front view
 */
Gallery.hideFrontDetails = function() {
	jQuery('#front .zoom .details').css('opacity', 0);
};

/**
 * Loading icon within front view - Turn on
 */
Gallery.loadingOn = function() {
	jQuery('.zoom .loader').show();
};

/**
 * Loading icon within front view - Turn off
 */
Gallery.loadingOff = function() {
	jQuery('.zoom .loader').hide();
};

/**
 * Initializer
 */
Gallery.go = function() {
	console.log('New GALGO')
    Gallery.loadAlgories(function() {
    	console.log('New Algories loaded');
        Gallery.DOMlisteners();
        Gallery.frontListeners();

        console.log('shouldShowFront is ', Gallery.shouldShowFront);
	    if (Gallery.shouldShowFront) {
		    // Get ID
		    var artworkID = location.search.split('artwork=')[1];
		    Gallery.fillFront(artworkID);
		    Gallery.showFront();
	    } else {
		    // Close potentially open front mode
		    Gallery.hideFront();
	    }

        /*
	    window.onhashchange = function() {
	    	console.log('onhashchange triggered');
		    // If hash doesn't contain 'art-id', hide front
		    if (location.hash.indexOf('art-id') === -1) {
		    	console.log('A')
			    if (Gallery.isFrontShown) Gallery.hideFront();
		    } else {
			    console.log('B')
			    var artworkID = location.search.split('artwork=')[1];
			    console.log('Filling front with ID ' + artworkID)
			    if (artworkID && artworkID.indexOf('art-id') > -1) {
				    console.log('C')
				    Gallery.fillFront(artworkID);
				    Gallery.showFront();
			    }
		    }
	    };

        // Fill with artwork if ID is given (/gallery?artwork=345)
        var artworkID = location.search.split('artwork=')[1];
        console.log('Filling front with ID ' + artworkID)
        if (artworkID && artworkID.indexOf('art-id') > -1) {
        	Gallery.fillFront(artworkID);
	        Gallery.showFront();
        }

        // Detect artwork ID, if no ID or if ID doesn't contain art-id, then not front mode

		*/

    });
};
Gallery.applyState = function() {
	if (!Gallery.algData.length) Gallery.go();
	else {
		if (Gallery.shouldShowFront) {
			// Get ID
			var artworkID = location.search.split('artwork=')[1];
			if (Gallery.fillFront(artworkID)) Gallery.showFront();
		} else {
			// Close potentially open front mode
			Gallery.hideFront();
		}
	}
};