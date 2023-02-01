let Gallery = {
	isInit: false,
	artworksData: [],
	timeout: undefined,
	currentImageObject: undefined
}
Gallery.loadArtworks = (extraCallback) => {
	let handleXML = (xml) => {
		Gallery.artworksData = []
		xml.querySelectorAll("artwork").forEach((el, i) => {
			// Store data in global variable
			let aw = {
				index: i,
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
				extraCallback()
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
Gallery.getArtwork = (id) => {
	console.log("Getting artwork with id " + id)
	return Gallery.artworksData.filter((artwork) => {
		return "art-id-" + artwork.id == id
	})[0]
}
Gallery.getArtworkAtIndex = (index) => {
	console.log("Getting artwork with index " + index)
	return Gallery.artworksData.filter((artwork) => {
		return artwork.index == index
	})[0]
}
Gallery.initListeners = () => {
	// Artworks blocks
	document.querySelectorAll(".artwork").forEach((el) => {
		let onclick = () => {
			// Update route history
			Global.router.push({
				path: 'gallery', query: { artwork: el.id }
			})
		}
		el.removeEventListener('click', onclick) // Justin Case
		el.addEventListener('click', onclick)
	})

	// #front elements
	document.querySelector("#front .quit").addEventListener('click', () => {
		Global.router.push({
			path: 'gallery'
		})
	})
	let resizingEventCount = 0
	window.addEventListener('resize', () => {
		resizingEventCount++
		setTimeout(() => {
			resizingEventCount--
			if (resizingEventCount == 0) {
				// Actual resize action
				Gallery.adjustFrontImageSize()
			}
		}, 500)
	})
	document.querySelector("#gallery-prev").addEventListener('click', () => {
		Global.router.push({ path: 'gallery', query: { artwork: "art-id-2018-9" } })
	})
	document.querySelector("#gallery-next").addEventListener('click', () => {
		console.log('click')
	})
}
Gallery.fillFront = (id) => {
	let artwork = Gallery.getArtwork(id)
	if (!artwork) return false

	Gallery.loadingOn()
	// Clear previous img
	document.querySelector('#front .zoom img.fullone').setAttribute('src', "")

	let src = artwork.src
	let title = artwork.title
	let description = artwork.description

	// Image
	let newImg = new Image()
	Gallery.currentImageObject = newImg// Store globally for .on('resize') action without reloading image
	newImg.onload = () => {
		document.querySelector('#front .zoom img.fullone').setAttribute('src', "")

		Gallery.adjustFrontImageSize()

		// Fake timeout
		clearTimeout(Gallery.timeout)
		Gallery.timeout = setTimeout(() => {
            Gallery.loadingOff()
			document.querySelector('#front .zoom img.fullone').setAttribute('src', src)
		}, 300)
	};
	newImg.src = src
	newImg.alt = title

	// Description
	document.querySelector('#front .zoom .details .description p.title').innerHTML = title
	document.querySelector('#front .zoom .details .description p.text').innerHTML = description
}
/**
 * Computes preview width and height based on current window size
 * And applies CSS rules to both .zoom container and image
 *
 * @returns Object {w, h}
 */
Gallery.adjustFrontImageSize = () => {
	let h = Gallery.currentImageObject.height;
	let w = Gallery.currentImageObject.width;

	// If image is bigger than 0.9*window, rescale
	let ratioW = w / (0.9 * jQuery(window).width())
	let ratioH = h / (0.9 * jQuery(window).height())
	let ratio = Math.max(ratioH, ratioW)
	if (ratio > 1 && ratioW > ratioH) {
		h /= ratioW;
		w /= ratioW;
	} else if (ratio > 1 && ratioH > ratioW) {
		h /= ratioH
		w /= ratioH
	}

	jQuery('#front .zoom, #front .zoom img.fullone').css('height', h).css('width', w)
}
Gallery.showFront = () => {
	document.getElementById('front').classList.remove('hidden')
	document.querySelector("body").classList.add('frozen')
}
Gallery.hideFront = function () {
	document.getElementById('front').classList.add('hidden')
	document.querySelector("body").classList.remove('frozen')
}
Gallery.loadingOn = function () {
	document.querySelector('.zoom .loader').classList.remove('hidden')
}
Gallery.loadingOff = function () {
	document.querySelector('.zoom .loader').classList.add('hidden')
}
Gallery.init = () => {
    Gallery.loadArtworks(() => {
        Gallery.initListeners()
    })
}
Gallery.update = () => {
	// Init if not done yet
	if (!Gallery.isInit) {
		Gallery.init()
		Gallery.isInit = true
	}
	// Get ID, might be undefined
	let artworkID = location.search.split('artwork=')[1]
	if (artworkID) {
		Gallery.fillFront(artworkID)
		Gallery.showFront()
	} else {
		Gallery.hideFront()
	}

}
