let Gallery = {
	artworksData: [],
	mouseIsOverFront: false,
	isFrontShown: false,
	shouldShowFront: false,
	timeout: undefined,
	currentImageObject: undefined
}

/**
 * Fills the DOM with artworks.xml
 * @param {Function} extraCallback Function called after the DOM is filled
 */
Gallery.loadArtworks = (extraCallback) => {

	let handleXML = (xml) => {
		Gallery.artworksData = []
		xml.querySelectorAll("artwork").forEach((el) => {
			// Store data in global variable
			let aw = {
				title: el.querySelector("title").innerHTML,
				id: el.querySelector("id").innerHTML,
				date: el.querySelector("date").innerHTML,
				src: "img/" + el.querySelector("src").innerHTML,
				small: "img/" + el.querySelector("small").innerHTML,
				description: el.querySelector("description").innerHTML
			}
		
			Gallery.artworksData.push(aw)

			// Inject artwork data DOM node
			if (document.querySelector("#art-id-" + aw.id)) {
				let img = document.createElement("img")
				img.src = aw.small
				img.alt = aw.title
				img.title = aw.title
				//img.width = 200
				//img.height = 200
				document.querySelector("#art-id-" + aw.id).appendChild(img)
			}
		})
		
	}

	const xhr = new XMLHttpRequest()

	xhr.open("GET", "data/artworks.xml", true)
	xhr.onload = (e) => {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				handleXML(xhr.responseXML)
			} else {
				console.error("Failed retrieving artworks data.")
				console.error(xhr.statusText)
			}
		}
	}
	xhr.onerror = (e) => {
		console.error(xhr.statusText)
	}
	xhr.send(null)

}

/**
 * Assuming the global array artworksData is filled
 * @param {Number} id ID of artwork
 * @returns {Object} Artwork object
 */
Gallery.getArtwork = (id) => {
	return Gallery.artworksData.filter((artwork) => {
		"art-id-" + artwork.id == id 
	})[0]
}

/**
 * Listeners on each artwork
 */
Gallery.initListeners = () => {
	// Artworks blocks
	document.querySelectorAll(".artwork").forEach((el) => {
		el.removeEventListener('click')
		el.addEventListener('click', () => {
			// Update route history
			Global.router.push({
				path: 'gallery', query: { artwork: jQuery(this).attr('id') }
			})
		})
	})
}

/**
 * Listeners for front view
 */
Gallery.frontListeners = function () {
	jQuery('#front .zoom').off().on({
		mouseenter: function () {
            Gallery.mouseIsOverFront = true;
			Gallery.showFrontDetails();
		}, mouseleave: function () {
            Gallery.mouseIsOverFront = false;
            Gallery.hideFrontDetails();
		}
	});
	jQuery('#front').off().on({
		mouseup: function () {
			if (Gallery.isFrontShown && !Gallery.mouseIsOverFront) {
				Global.router.push({
					path: 'gallery', query: { artwork: 0 }
				});
			}
		}
	});
	jQuery('#front .zoom .quit').off().on({
		mouseup: function () {
			Global.router.push({
				path: 'gallery', query: { artwork: 0 }
			});
		}
	});
	let resizingEventCount = 0;
	jQuery(window).off().on('resize', function () {
		resizingEventCount++;
		setTimeout(function () {
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
 * DOM filler called on demand (click on an artwork)
 */
Gallery.fillFront = (id) => {

	let alg = Gallery.getArtwork(id)
	if (!alg) return false

	Gallery.loadingOn()
	// Clear previous img
    jQuery('#front .zoom img.fullone').attr('src', '')

	let src = alg.src
	let title = alg.title
	let description = alg.description

	// Image
	let newImg = new Image()
	Gallery.currentImageObject = newImg// Store globally for .on('resize') action without reloading image
	newImg.onload = function () {
		jQuery('#front .zoom img.fullone').attr('src', '')

		Gallery.adjustFrontImageSize()

		// Fake timeout
		clearTimeout(Gallery.timeout)
		let self = this
		Gallery.timeout = setTimeout(function () {
            Gallery.loadingOff()
			jQuery('#front .zoom img.fullone').attr('src', self.src)
		}, 300)
	};
	newImg.src = src
	newImg.alt = title

	// Description
	jQuery('#front .zoom .details .description p.title').html(title)
	jQuery('#front .zoom .details .description p.text').html(description)

	return true
}

/**
 * Computes preview width and height based on current window size
 * And applies CSS rules to both .zoom container and image
 *
 * @returns Object {w, h}
 */
Gallery.adjustFrontImageSize = function () {
	let h = Gallery.currentImageObject.height;
	let w = Gallery.currentImageObject.width;

	// If image is bigger than 0.9*window, rescale
	let ratioW = w / (0.9 * jQuery(window).width());
	let ratioH = h / (0.9 * jQuery(window).height());
	let ratio = Math.max(ratioH, ratioW);
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
Gallery.showFront = function () {
	Gallery.isFrontShown = true

	jQuery('#front').css('display', 'inherit')
}

/**
 * Hides front view
 */
Gallery.hideFront = function () {
	Gallery.isFrontShown = false

	jQuery('#front').css('display', 'none')
}

/**
 * Shows details in front view
 */
Gallery.showFrontDetails = function () {
	jQuery('#front .zoom .details').css('opacity', 1)
}

/**
 * Hides details in front view
 */
Gallery.hideFrontDetails = function () {
	jQuery('#front .zoom .details').css('opacity', 0)
};

/**
 * Loading icon within front view - Turn on
 */
Gallery.loadingOn = function () {
	jQuery('.zoom .loader').show()
}

/**
 * Loading icon within front view - Turn off
 */
Gallery.loadingOff = function () {
	jQuery('.zoom .loader').hide()
}

/**
 * Initializer
 */
Gallery.go = () => {
    Gallery.loadArtworks(() => {
        Gallery.initListeners()
        Gallery.frontListeners()

	    if (Gallery.shouldShowFront) {
		    // Get ID
		    let artworkID = location.search.split('artwork=')[1]
		    if (Gallery.fillFront(artworkID)) Gallery.showFront()
	    } else {
		    // Close potentially open front mode
		    Gallery.hideFront()
	    }
    })
}
Gallery.applyState = () => {
	if (!Gallery.artworksData.length) Gallery.go()
	else {
		if (Gallery.shouldShowFront) {
			// Get ID
			let artworkID = location.search.split('artwork=')[1]
			if (Gallery.fillFront(artworkID)) Gallery.showFront()
		} else {
			// Close potentially open front mode
			Gallery.hideFront()
		}
	}
}
