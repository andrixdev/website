let Gallery = {
	isInit: false,
	artworksData: [],
	artworksOnPage: 0,
	loadCount: 0,
	currentArtworkShown: undefined,
	currentImageObject: undefined,
	timeout: undefined,
}
Gallery.loadArtworks = (extraCallback) => {
	let handleXML = (xml) => {
		Gallery.artworksData = []
		Gallery.loadCount = 0
		Gallery.artworksOnPage = 0

		// Store data and create image elements
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
				Gallery.artworksOnPage++
				let img = document.createElement("img")

				// Set loaded state to true once done
				img.addEventListener('load', () => {
					Gallery.updateImageLoadCount()
				})

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
Gallery.updateImageLoadCount = () => {
	Gallery.loadCount++

	// Now check if all are loaded to maybe launch... Masonry!!!! \o/
	if (Gallery.loadCount == Gallery.artworksOnPage) {
		Masonry.init()
	}
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

				// Well, update masonry
				Masonry.init()
			}
		}, 500)
	})
	let len = Gallery.artworksData.length
	document.querySelector("#gallery-prev").addEventListener('click', () => {
		let newIndex = (len + Gallery.currentArtworkShown.index - 1) % len // adding len because modulo allows negatives
		let newArtwork = Gallery.getArtworkAtIndex(newIndex)
		Global.router.push({ path: 'gallery', query: { artwork: 'art-id-' + newArtwork.id } })
	})
	document.querySelector("#gallery-next").addEventListener('click', () => {
		let newIndex = (len + Gallery.currentArtworkShown.index + 1) % len // adding len because modulo allows negatives
		let newArtwork = Gallery.getArtworkAtIndex(newIndex)
		Global.router.push({ path: 'gallery', query: { artwork: 'art-id-' + newArtwork.id } })
	})
}
Gallery.fillFront = (id) => {
	let artwork = Gallery.getArtwork(id)
	if (!artwork) return false

	Gallery.currentArtworkShown = artwork
	Gallery.loadingOn()

	let src = artwork.src
	let title = artwork.title
	let description = artwork.description

	// Image
	let newImg = new Image()
	Gallery.currentImageObject = newImg // Store globally for .on('resize') action without reloading image

	document.querySelector('#front-artwork img.fullone').setAttribute('src', "")
	newImg.onload = () => {
		document.querySelector('#front-artwork img.fullone').setAttribute('src', "")

		Gallery.adjustFrontImageSize()

		// Fake timeout
		clearTimeout(Gallery.timeout)
		Gallery.timeout = setTimeout(() => {
            Gallery.loadingOff()
			document.querySelector('#front-artwork img.fullone').setAttribute('src', src)
		}, 300)
	}
	newImg.src = src
	newImg.alt = title

	// Description
	document.querySelector('#front-artwork .details .description h3.title').innerHTML = title
	document.querySelector('#front-artwork .details .description p.text').innerHTML = description
}
Gallery.adjustFrontImageSize = () => {
	if (!Gallery.currentImageObject) return false

	let h = Gallery.currentImageObject.height
	let w = Gallery.currentImageObject.width

	// If image is bigger than 0.9*window, rescale
	let ratioW = w / (0.9 * jQuery(window).width())
	let ratioH = h / (0.9 * jQuery(window).height())
	let ratio = Math.max(ratioH, ratioW)
	if (ratio > 1 && ratioW > ratioH) {
		h /= ratioW
		w /= ratioW
	} else if (ratio > 1 && ratioH > ratioW) {
		h /= ratioH
		w /= ratioH
	}

	jQuery('#front-artwork img.fullone').css('height', h).css('width', w)
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
	document.querySelector('#front-artwork .loader').classList.remove('hidden')
}
Gallery.loadingOff = function () {
	document.querySelector('#front-artwork .loader').classList.add('hidden')
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
	if (artworkID != undefined) {
		Gallery.fillFront(artworkID)
		Gallery.showFront()
	} else {
		Gallery.hideFront()
		Gallery.currentArtworkShown = undefined
	}

}

let Masonry = {
	containerNode: undefined,
	containerHeight: 0,
	children: [],
	margins: 20, //px
	breakpoints: {
		oneCol: 450,
		twoCols: 850,
		threeCols: 1150,
	}
}

Masonry.init = function (containerNode) {
	let ctn = document.querySelector("#artworks")
	this.containerNode = ctn
	this.children = ctn.children

	// Setup absolute positioning
	ctn.style.position = "relative"
	let colHeights = []
	let xPercent = 100, cols = 1
	if (window.innerWidth <= this.breakpoints.oneCol) { colHeights = [0]; }
	else if (window.innerWidth <= this.breakpoints.twoCols) { colHeights = [0, 0]; cols = 2; }
	else if (window.innerWidth <= this.breakpoints.threeCols) { colHeights = [0, 0, 0]; cols = 3; }
	else { colHeights = [0, 0, 0, 0]; cols = 4; }
	xPercent *= 1 / cols

	Array.from(this.children).forEach((el) => {
		// Determine which column is the emptiest
		let minIndex = 0, minColHeight = colHeights[0]
		colHeights.forEach((ch, index) => {
			if (ch < minColHeight) {
				minColHeight = ch
				minIndex = index
			}
		})

		// Position artwork in the layout
		let w = xPercent + "% - " + this.margins + "px"
		let wCalc = "calc(" + w + ")"
		let x = xPercent * minIndex + "% + " + this.margins / 2 + "px" 
		let xCalc = "calc(" + x + ")"
		
		let y = minColHeight
		el.style.position = "absolute"
		el.style.width = wCalc
		el.style.left = xCalc
		el.style.top = (y + this.margins) + "px"

		// Update chosen column height
		colHeights[minIndex] += el.clientHeight + this.margins
	})

	// Compute max of heights for container
	let max = 0
	colHeights.forEach((ch) => {
		if (ch > max) max = ch
	})
	this.containerHeight = max + this.margins

	// Finally resize container
	this.containerNode.style.width = "100%"
	this.containerNode.style.height = this.containerHeight + "px"

}
