/**
 * JS for icosacid.com
 *
 * @author Alexandre Andrieux <alex@icosacid.com>
 * @since 2015-03
 *
 * Changes in algories.js shall be duplicated in pro.js
 * JS files on respective pages are independent
 *
 * Being re-coded...
 */

let Gallery = {
	algData: [],
	mouseIsOverFront: false,
};

/**
 * Fills the DOM with algories.xml
 * @param {Function} extraCallback Function called after the DOM is filled
 */
Gallery.loadAlgories = (extraCallback) => {
	let gallery = jQuery('#whole');
	jQuery
	.get("algories.xml", {})
	.done((data) => {
	
		let jAlgories = jQuery(data).find('algories');
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
Gallery.getAlg = (id) => {
	for (key in Gallery.algData) {
		for (key2 in Gallery.algData[key].alg) {
			if ('art-id-' + Gallery.algData[key].alg[key2].id == id) {
				return Gallery.algData[key].alg[key2];
			}
		}
	}
	console.log('Nothing found with ID ' + id);
};

/**
 * Listeners on each algory
 */
Gallery.DOMlisteners = () => {
	// Algories blocks
	jQuery('.alg').on({
		mouseenter: function() {
			jQuery(this).find('h4.title').css('opacity','1');
			jQuery(this).css('box-shadow','rgba(255,255,255,0.5) 0 0 10px');
		}, mouseleave: function() {
			jQuery(this).find('h4.title').css('opacity','0');
			jQuery(this).css('box-shadow','none');
		}, mouseup: function() {
			Gallery.showFront();
			Gallery.fillFront(jQuery(this));
		}
	});
	
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
};

/**
 * Listeners for front view
 */
Gallery.frontListeners = () => {
	jQuery('#front .zoom').on({
		mouseenter: function() {
            Gallery.mouseIsOverFront = true;
			Gallery.showFrontDetails();
		}, mouseleave: function() {
            Gallery.mouseIsOverFront = false;
            Gallery.hideFrontDetails();
		}
	});
	jQuery('#front').on({
		mouseup: function() {
			if (!Gallery.mouseIsOverFront) {
                Gallery.hideFront();
			}
		}
	});
	jQuery('#front .zoom .quit').on({
		mouseup: function() {
            Gallery.hideFront();
		}
	});
};

/**
 * DOM filler called on demand (click on an algory)
 */
Gallery.fillFront = (jAlgNode) => {
	
	Gallery.loadingOn();
	
	var id = jAlgNode.attr('id');
	var src = Gallery.getAlg(id).src;
	var title = Gallery.getAlg(id).title;
	var description = Gallery.getAlg(id).description;
	var deviant = Gallery.getAlg(id).deviant;
	var github = Gallery.getAlg(id).github;
	
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
}

/**
 * Shows front view
 */
Gallery.showFront = () => {
	jQuery('#front').css('display', 'inherit').animate({
		opacity: 1
	}, 1000);
};

/**
 * Hides front view
 */
Gallery.hideFront = () => {
	jQuery('#front').animate({
		opacity: 0
	}, 500, function() {
		jQuery(this).css('display', 'none');
	});
};

/**
 * Shows details in front view
 */
Gallery.showFrontDetails = () => {
	jQuery('#front .zoom .details').css('opacity', 1);
};

/**
 * Hides details in front view
 */
Gallery.hideFrontDetails = () => {
	jQuery('#front .zoom .details').css('opacity', 0);
};

/**
 * Loading icon within front view - Turn on
 */
Gallery.loadingOn = () => {
	jQuery('.zoom .loader').show();
};

/**
 * Loading icon within front view - Turn off
 */
Gallery.loadingOff = () => {
	jQuery('.zoom .loader').hide();
};

/**
 * Initializer
 */
Gallery.go = () => {
    Gallery.loadAlgories(() => {
        Gallery.DOMlisteners();
        Gallery.frontListeners();
    });
};
