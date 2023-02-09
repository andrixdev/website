var NotFoundComponent = {
    template: document.querySelector("#not-found-template").innerHTML,
    data: function () {
        return {
            requestedRoute: undefined
        }
    },
    mounted: function () {
        this.requestedRoute = this.$route.path

        // Glass icosahedron
        let diedral = Math.PI - Math.asin(2/3)
        let a = 200
        let V3 = Math.sqrt(3)
        let ang = Math.PI - diedral
        let x3Drot = 1/2, y3Drot = V3/2, z3Drot = 0
        let transform = '', transformA = ''
        let t = 0
        let ico = document.querySelector(".icosahedron")

        // Base face (1)
        document.querySelector(".triangle").classList.add('triangle1')
        
        // First upper/lower face (A1)
        //p_prime = p.cloneNode(true);
        let firstClone = document.querySelector(".triangle1").cloneNode(true)
        firstClone.classList.remove('triangle1')
        firstClone.classList.add('triangleA1')
        ico.appendChild(firstClone)
        transformA = 'rotateZ(-60deg) rotate3d(' + x3Drot + ', ' + y3Drot + ', ' + z3Drot + ', ' + ang + 'rad)'
        
        document.querySelector('.triangleA1').style.transform = transformA

        // Base 10 faces (9 left)
        for (let i = 2; i <= 10; i++) {
            // Add base face
            let klonePrev = document.querySelector(".triangle" + (i-1)).cloneNode(true)
            klonePrev.classList.remove('triangle' + (i-1))
            klonePrev.classList.add('triangle' + i)
            ico.appendChild(klonePrev)
            
            let translation = (i % 2 == 0 ? 'translateX(' + a + 'px)' : '')
            let zRot = (i % 2 == 0 ? 'rotateZ(60deg)' : 'rotateZ(-60deg)')
            transform += translation + ' ' + zRot + ' rotate3d(' + x3Drot + ', ' + y3Drot + ', ' + z3Drot + ', ' + ang + 'rad)'
            document.querySelector(".triangle" + i).style.transform = transform

            // Add upper/lower corresponding face
            let klone = document.querySelector(".triangle" + i).cloneNode(true)
            klone.classList.remove('triangle' + i)
            klone.classList.add('triangleA' + i)
            ico.appendChild(klone)
            if (i % 2 == 0) {
                transformA = transform + 'translateX(' + a * 1/2 + 'px) translateY(' + a * V3/2 + 'px) rotateZ(-60deg) rotate3d(' + x3Drot + ', ' + 0 + ', ' + z3Drot + ', ' + -ang + 'rad)'
            } else {
                transformA = transform + 'rotateZ(-60deg) rotate3d(' + x3Drot + ', ' + y3Drot + ', ' + z3Drot + ', ' + ang + 'rad)'
            }
            document.querySelector(".triangleA" + i).style.transform = transformA
        }

        let rotateIco = () => {
            // Rotate icosahedron
            var rX = 360 * Math.sin(t / 160)
            var rY = 360 * Math.sin(t / 240)
            var rZ = 360 * Math.sin(t / 400)

            ico.style.transform = 'rotateX(' + rX + 'deg) rotateY(' + rY + 'deg) rotateZ(' + rZ + 'deg)'

            // Animate face
            let face = (Math.random() > 0.5 ? 'A': '') + Math.ceil(10 * Math.random())
            let lum = 20 + 60 * Math.random()
            let opacity = (Math.random() > 0.5 ? 1 : 0.2)

            let randomFace = document.querySelector(".triangle" + face + " .depth2")
            if (randomFace) {// Maybe user changed page and triangles are gone, randomFace is undefined
                randomFace.style.background = 'radial-gradient(hsla(200, 60%, ' + lum + '%, ' + opacity + '), hsla(200, 60%, ' + lum/3 + '%, ' + opacity + ')'
            }
            
            t++
        }

        // Power!
		var frame = () => {
        	rotateIco()
        	requestAnimationFrame(frame)
		}

        frame()

    }
}
