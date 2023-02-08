var AboutComponent = {
    template: document.querySelector('#about-template'),
    data: function () {
        return { }
    },
    methods: {
        activateBioQuanticGlitch: function () {
            // Prepare empty arrays with texts
            let paragraphs = document.querySelectorAll(".statement-core p")
            let htmlContents = [] // Initial markup (including <em>s and such)
            let textContents = [] // Raw initial text
            let textArrays = [] // Splitted initial text
            let newArrays = [] // Shuffled text

            // Fill with text
            paragraphs.forEach((el) => {
                let htmlContent = el.innerHTML
                let textContent = el.innerText
                let textArray = textContent.split(' ')
                let newArray = textArray.slice(0) // Just clones

                htmlContents.push(htmlContent)
                textContents.push(textContent)
                textArrays.push(textArray)
                newArrays.push(newArray)
            })

            // Listeners
            paragraphs.forEach((el, i) => {
                el.addEventListener('mousemove', () => {
                    let newArray = newArrays[i]

                    // Shuffle 2 words in new array
                    let len = newArray.length
                    let randomIndex1 = Math.floor(len * Math.random())
                    let randomIndex2 = Math.floor(len * Math.random())
                    let buffer = newArray[randomIndex1]
                    newArray[randomIndex1] = newArray[randomIndex2]
                    newArray[randomIndex2] = buffer

                    // Build word outta array and print out
                    let newText = ""
                    for (let j = 0; j < len; j++) {
                        let rand = Math.random() < 0.1
                        if (rand) newText += "<em>"
                        newText += newArray[j] + " "
                        if (rand) newText += "</em>"
                    }
                    el.innerHTML = newText
                })
                el.addEventListener('mouseout', () => {
                    // Reset text
                    el.innerHTML = htmlContents[i]

                    // Start shuffling anew on each hoverin
                    newArrays[i] = textArrays[i].slice(0)
                })
            })
        }
    },
    mounted: function () {

        this.activateBioQuanticGlitch()

        // Show past events
        document.querySelector(".load-past-events").addEventListener('click', () => {
            document.querySelector(".showmore-toggle-bar.load-past-events").classList.add('hidden')
            document.querySelector(".past-events").classList.remove('hidden')
        })
    }
}
