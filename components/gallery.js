let Gallery = {
	isInit: false,
	artworksData: [],
	artworksOnPage: 0,
	loadCount: 0,
	currentArtworkShown: undefined,
	currentImageObject: undefined,
	isFrontVisible: false,
	timeout: undefined,
	mobileBreakpointPX: 550,
	screenWidth: undefined // buffer to check the nature of resize events
}
Gallery.loadArtworks = (extraCallback) => {
	let handleXML = (xml) => {
		Gallery.artworksData = []

		// Store data and create data image elements
		xml.querySelectorAll("artwork").forEach((el, i) => {
			// Store data in global variable
			let aw = {
				index: i,
				title: el.querySelector("title").innerHTML,
				id: el.querySelector("id").innerHTML,
				date: el.querySelector("date").innerHTML,
				src: "/img/" + el.querySelector("src").innerHTML,
				small: "/img/" + el.querySelector("small").innerHTML,
				description: el.querySelector("description").innerHTML,
				short: el.querySelector("short").innerHTML,
				dimensions: el.querySelector("dimensions").innerHTML,
				extratext: el.querySelector("extratext").innerHTML,
				rawprice: el.querySelector("rawprice").innerHTML,
				extraprice: el.querySelector("extraprice").innerHTML
			}
			Gallery.artworksData.push(aw)
		})	
	}
	const xhr = new XMLHttpRequest()
	xhr.open("GET", "/data/artworks.xml", true)
	xhr.onload = (e) => {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				handleXML(xhr.responseXML)
				extraCallback()
			} else {
				console.error("Failed to retrieve artworks data.")
				console.error(xhr.statusText)
			}
		}
	}
	xhr.onerror = (e) => {
		console.error(xhr.statusText)
	}
	xhr.send(null)
}
Gallery.injectArtworks = () => {
	Gallery.artworksOnPage = 0
	Gallery.loadCount = 0
	Gallery.artworksData.forEach((aw) => {
		// Inject artworks if divs are chosen to receive content
		let node = document.querySelector("#art-id-" + aw.id)
		if (node) {
			// Empty node because it might already be filled
			node.innerHTML = ""

			Gallery.artworksOnPage++
			let img = document.createElement("img")

			// Set loaded state to true once done
			img.addEventListener('load', Gallery.updateImageLoadCount)

			img.src = aw.small
			img.alt = aw.title
			img.title = aw.title
			node.appendChild(img)
		}
	})
}
Gallery.updateImageLoadCount = () => {
	Gallery.loadCount++

	// Now check if all are loaded to maybe launch... Masonry!!!! \o/
	if (Gallery.loadCount == Gallery.artworksOnPage) {
		// Give some time for DOM to calculate img client heights <--- current masonry 1st load bug is here, some images haven't actually been loaded in DOM with the right clientHeight
		console.log("all images loaded, triggering masonry in 350ms")
		setTimeout(() => { Masonry.init() }, 350)
		//Masonry.init()
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
	Gallery.initArtworksListeners()
	Gallery.initFrontListeners()
	Gallery.screenWidth = window.innerWidth

	// Window resize
	let resizingEventCount = 0
	let onresize = () => {
		// Verify that we are well on Gallery
		if (!document.querySelector("#artworks")) return false

		// Avoid resizes triggered by native mobile header hiding
		if (window.innerWidth == Gallery.screenWidth) return false
		else Gallery.screenWidth = window.innerWidth

		resizingEventCount++

		// Hide masonry
		Gallery.loadingOn()
		setTimeout(() => {
			resizingEventCount--
			if (resizingEventCount == 0) {
				// Actual resize action
				Gallery.adjustFrontImageSize()

				// Well, update masonry
				Masonry.init()

				// Show masonry anew!
				Gallery.loadingOff()
			}
		}, 400)
	}
	window.removeEventListener('resize', onresize)
	window.addEventListener('resize', onresize)
}
Gallery.initArtworksListeners = () => {
	document.querySelectorAll(".artwork").forEach((el) => {
		let onArtworkClick = () => {
			// Update route history
			Global.router.push({
				path: 'gallery', query: { artwork: el.id }
			})
		}
		el.removeEventListener('click', onArtworkClick) // Justin Case of several initListeners call (likely due to Vue)
		el.addEventListener('click', onArtworkClick)
	})
}
Gallery.initFrontListeners = () => {
	let onQuitClick = () => {
		Global.router.push({
			path: 'gallery'
		})
	}
	let len = Gallery.artworksData.length
	let onPrevClick = () => {
		let newIndex = (len + Gallery.currentArtworkShown.index - 1) % len // adding len because modulo allows negatives
		let newArtwork = Gallery.getArtworkAtIndex(newIndex)
		Global.router.push({ path: 'gallery', query: { artwork: 'art-id-' + newArtwork.id } })
	}
	let onNextClick = () => {
		let newIndex = (len + Gallery.currentArtworkShown.index + 1) % len // adding len because modulo allows negatives
		let newArtwork = Gallery.getArtworkAtIndex(newIndex)
		Global.router.push({ path: 'gallery', query: { artwork: 'art-id-' + newArtwork.id } })
	}
	let onKeyup = (event) => {
		if (!Gallery.isFrontVisible) return false
		if (event.keyCode == 37) onPrevClick() // Left arrow
		else if (event.keyCode == 39) onNextClick() // Right arrow
	}

	let xLastTouch = null
	let yLastTouch = null
	let isSwipingOnFullImg = false
	let onTouchStart = (evt) => {
		if (!Gallery.isFrontVisible) return false
		const firstTouch = evt.touches[0]
		xLastTouch = firstTouch.clientX
		yLastTouch = firstTouch.clientY
	}
	let onTouchMove = (evt) => {
		if (!Gallery.isFrontVisible) return false
		if (!xLastTouch || !yLastTouch) return false
		if (isSwipingOnFullImg) return false
	
		let xTouch = evt.touches[0].clientX
		let yTouch = evt.touches[0].clientY

		var xDiff = xTouch - xLastTouch
		var yDiff = yTouch - yLastTouch

		if (Math.abs(xDiff) > Math.abs(yDiff)) { // If translation in X-direction is superior to the Y-direction
			if (xDiff > 0) {
				// Right swipe
				onPrevClick()
			} else {
				// Left swipe
				onNextClick()
			}
		}
			
		xLastTouch = null
		yLastTouch = null
	}

	document.querySelector("#front .quit").removeEventListener('click', onQuitClick)
	document.querySelector("#front .quit").addEventListener('click', onQuitClick)
	document.querySelector("#gallery-prev").removeEventListener('click', onPrevClick)
	document.querySelector("#gallery-prev").addEventListener('click', onPrevClick)
	document.removeEventListener('keyup', onKeyup)
	document.addEventListener('keyup', onKeyup)
	document.querySelector("#gallery-next").removeEventListener('click', onNextClick)
	document.querySelector("#gallery-next").addEventListener('click', onNextClick)
	document.querySelector("#front img.fullone").addEventListener('touchstart', () => {
		isSwipingOnFullImg = true
	})
	document.querySelector("#front img.fullone").addEventListener('touchend', () => {
		isSwipingOnFullImg = false
	})
	document.addEventListener('touchstart', onTouchStart)
	document.addEventListener('touchmove', onTouchMove)
}
Gallery.fillFront = (id) => {
	let aw = Gallery.getArtwork(id)
	if (!aw) return false

	Gallery.currentArtworkShown = aw
	Gallery.frontLoadingOn()

	// Image
	let newImg = new Image()
	Gallery.currentImageObject = newImg // Store globally for .on('resize') action without reloading image

	let imgNode = document.querySelector('#front-artwork img.fullone')
	imgNode.classList.add('invisible')
	imgNode.setAttribute('src', "")
	newImg.onload = () => {
		document.querySelector('#front-artwork img.fullone').setAttribute('src', aw.src)
		imgNode.classList.remove('invisible')
		Gallery.frontLoadingOff()

		Gallery.adjustFrontImageSize()
	}
	newImg.src = aw.src
	newImg.alt = aw.title

	// Descriptions
	document.querySelector('#front-artwork .details .description h3.title').innerHTML = aw.title
	let fullPrice = aw.rawprice - (-aw.extraprice)
	let txt = ""
	txt += (aw.short.length ? aw.short + "<br/><br/>" : "")
	txt += (aw.extratext.length ? aw.extratext + "<br/>" : "")
	txt += "<span>" + fullPrice + " euros</span>"
	document.querySelector('#front-artwork .details .description p.text').innerHTML = txt

	// Purchase information
	document.querySelectorAll(".artwork-name").forEach(el => el.innerHTML = aw.title)
	document.querySelector(".artwork-dimensions").innerHTML = aw.dimensions
	document.querySelector("#artwork-description").innerHTML = (aw.description.length ? "Description:<br/><strong>" + aw.description + "<strong><br/><br/>" : "")
	document.querySelector("#artwork-full-price").innerHTML = fullPrice
	document.querySelector("#artwork-extra-price").innerHTML = aw.extraprice
	document.querySelector("#artwork-contact").onclick = function () {
		let hrefString = ""
		hrefString += decryptString("nbjmup+bmfyAbmfyboesjy/dpn", -1)
		hrefString += "?subject=Artwork%20" + aw.title
		hrefString += "&body=Hi%2C%0D%0A%0D%0AI%20would%20like%20to%20get%20in%20touch%20with%20you%20about%20the%20artwork%20" + aw.title + ".%0D%0APlease%20come%20back%20to%20me%20with%20information%20about%20how%20we%20can%20proceed%20for%20a%20purchase.%0D%0A%0D%0AName%3A%20" + aw.title + "%0D%0AStandard%20dimensions%3A%20" + aw.dimensions + "%0D%0A%0D%0AOther%20information%3A%0D%0A-%0D%0A%0D%0ABest%20regards%2C%0D%0A-"
		location.href = hrefString
		return false
	}
}
Gallery.adjustFrontImageSize = () => {
	if (!Gallery.currentImageObject) return false

	let h = Gallery.currentImageObject.height
	let w = Gallery.currentImageObject.width

	// If image is wider than 0.9*window - (withofnavarrows), rescale
	let isMobile = window.innerWidth < Gallery.mobileBreakpointPX
	let marginW = isMobile ? 12 : 70
	let marginH = isMobile ? 12 : 20
	let ratioW = w / (0.99 * window.innerWidth - 2 * marginW)
	let ratioH = h / (0.99 * window.innerHeight - 2 * marginH)
	let ratio = Math.max(ratioH, ratioW)
	if (ratio > 1 && ratioW > ratioH) {
		h /= ratioW
		w /= ratioW
	} else if (ratio > 1 && ratioH > ratioW) {
		h /= ratioH
		w /= ratioH
	}

	document.querySelector("#front-artwork img.fullone").setAttribute('height', h)
	document.querySelector("#front-artwork img.fullone").setAttribute('width', w)
	document.querySelector("#front-artwork img.fullone").style.marginTop = "calc(50vh - " + h/2 + "px)"
}
Gallery.showFront = () => {
	document.getElementById("front").classList.remove('hidden')
	document.querySelector("body").classList.add('frozen')
	Gallery.isFrontVisible = true
}
Gallery.hideFront = () => {
	document.getElementById("front").classList.add('hidden')
	document.querySelector("body").classList.remove('frozen')
	Gallery.isFrontVisible = false
}
Gallery.loadingOn = () => {
	document.querySelector('#artworks-loader.loader').classList.remove('hidden')
	document.querySelector('#artworks').classList.add('hidden')
}
Gallery.loadingOff = () => {
	document.querySelector('#artworks-loader.loader').classList.add('hidden')
	document.querySelector('#artworks').classList.remove('hidden')
}
Gallery.frontLoadingOn = () => {
	document.querySelector('#front-artwork .loader').classList.remove('hidden')
}
Gallery.frontLoadingOff = () => {
	document.querySelector('#front-artwork .loader').classList.add('hidden')
}
Gallery.update = () => {
	Gallery.loadingOn()
	if (!Gallery.isInit) {
		Gallery.loadArtworks(() => {
			Gallery.injectArtworks()
			Gallery.initListeners()
			Gallery.isInit = true
			Gallery.updateFront()
		})
	} else {
		Gallery.injectArtworks()
		Gallery.initArtworksListeners()
		Gallery.updateFront()
	}
}
Gallery.updateFront = () => {
	// Get ID from route, might be undefined
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
		oneCol: 550,
		twoCols: 950,
		threeCols: 1250,
	}
}
Masonry.init = function () {
	
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

	// AAAnd it's all ready
	Gallery.loadingOff()
}
