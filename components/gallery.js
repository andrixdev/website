var Gallery = {
	algData: [],
	mouseIsOverFront: false,
	isFrontShown: false,
	shouldShowFront: false,
	timeout: undefined,
	currentImageObject: undefined
};

/**
 * Fills the DOM with algories-2.xml
 * @param {Function} extraCallback Function called after the DOM is filled
 */
Gallery.loadAlgories2 = function(extraCallback) {
	jQuery
		.get("data/algories-2.xml", {})
		.done(function(data) {

			var DOMgallery = jQuery('.gallery-content-2');
			var jAlgories = jQuery(data).find('algories');

			// Data retrieval and DOM fill
			jAlgories.find('alg').each(function() {
				var title = jQuery(this).find('title').text();
				var src = "img/" + jQuery(this).find('src').text();
				var small = "img/" + jQuery(this).find('small').text();
				var description = jQuery(this).find('description').text();
				var id = jQuery(this).find('artid').text();

				// Fill the DOM
				var markup = "";
				markup += "<img src='" + small + "' alt ='" + title + "'/>";
				markup += "<h4 class='title'>" + title + "</h4>";

				// Fill the gallery data object
				Gallery.algData.push({
					id: id,
					title: title,
					src: src,
					small: small,
					description: description,
					markup: markup
				});

				// Come on, fill the DOhomM
				DOMgallery.find('.alg#' + 'art-id-' + id).html(markup);
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
		if ('art-id-' + Gallery.algData[key].id == id) {
			return Gallery.algData[key];
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
	var resizingEventCount = 0;
	jQuery(window).off().on('resize', function() {
		resizingEventCount++;
		setTimeout(function() {
			resizingEventCount--;
			if (resizingEventCount == 0) {
				// Actual resize action
				Gallery.adjustFrontImageSize();
			}
		}, 500);
		// Ca marche du feu de Dieu, comme disait l'autre
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
    jQuery('#front .zoom img.fullone').attr('src', '');

	var src = alg.src;
	var title = alg.title;
	var description = alg.description;
	
	// Image
	var newImg = new Image();
	Gallery.currentImageObject = newImg;// Store globally for .on('resize') action without reloading image
	newImg.onload = function() {
		jQuery('#front .zoom img.fullone').attr('src', '');

		Gallery.adjustFrontImageSize();

		// Fake timeout
		clearTimeout(Gallery.timeout);
		var self = this;
		Gallery.timeout = setTimeout(function() {
            Gallery.loadingOff();
			jQuery('#front .zoom img.fullone').attr('src', self.src);
		}, 300);
	};
	newImg.src = src;
	newImg.alt = title;
	
	// Description
	jQuery('#front .zoom .details .description p.title').html(title);
	jQuery('#front .zoom .details .description p.text').html(description);

	return true;
};

/**
 * Computes preview width and height based on current window size
 * And applies CSS rules to both .zoom container and image
 *
 * @returns Object {w, h}
 */
Gallery.adjustFrontImageSize = function() {
	var h = Gallery.currentImageObject.height;
	var w = Gallery.currentImageObject.width;

	// If image is bigger than 0.9*window, rescale
	var ratioW = w / (0.9 * jQuery(window).width());
	var ratioH = h / (0.9 * jQuery(window).height());
	var ratio = Math.max(ratioH, ratioW);
	if (ratio > 1 && ratioW > ratioH) {
		h /= ratioW;
		w /= ratioW;
	} else if (ratio > 1 && ratioH > ratioW) {
		h /= ratioH;
		w /= ratioH;
	}

	jQuery('#front .zoom, #front .zoom img.fullone').css('height', h).css('width', w);
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
    Gallery.loadAlgories2(function() {
        Gallery.DOMlisteners();
        Gallery.frontListeners();

	    if (Gallery.shouldShowFront) {
		    // Get ID
		    var artworkID = location.search.split('artwork=')[1];
		    if (Gallery.fillFront(artworkID)) Gallery.showFront();
	    } else {
		    // Close potentially open front mode
		    Gallery.hideFront();
	    }
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