var AboutComponent = {
    template: document.querySelector('#about-template'),
    data: function () {
        return { }
    },
    methods: {
        // Icon & color category for each metric id, matching the static sobriety section's scheme
        carbonMetricMeta: {
            'energy':               { icon: 'fa-bolt',   category: 'consumption' },
            'wifi':                 { icon: 'fa-wifi',   category: 'data' },
            '5g':                   { icon: 'fa-signal', category: 'data' },
            'cold-water':           { icon: 'fa-glass',  category: 'water' },
            'hot-water':            { icon: 'fa-glass',  category: 'water' },
            'gasoline':             { icon: 'fa-car',    category: 'transport-gasoline' },
            'kerosene':             { icon: 'fa-plane',  category: 'transport-kerosene' },
            'train-travels':        { icon: 'fa-train',  category: 'transport-train' },
            'ai-engine-prompts':    { icon: 'fa-cube',   category: 'ai' },
            'ai-copilot-prompts':   { icon: 'fa-cube',   category: 'ai' },
            'ai-copilot-credits':   { icon: 'fa-cube',   category: 'ai' },
            'ai-gemini-prompts':    { icon: 'fa-cube',   category: 'ai' },
            'ai-claude-input-tokens':  { icon: 'fa-cube', category: 'ai' },
            'ai-claude-output-tokens': { icon: 'fa-cube', category: 'ai' },
            'produced-software':    { icon: 'fa-github', category: 'data' },
            'cloud-data':           { icon: 'fa-cloud',  category: 'data' },
            'local-data':           { icon: 'fa-database', category: 'data' }
        },
        // Some metrics are stored in a smaller unit than what makes sense to display
        carbonMetricUnitOverride: {
            'energy':      { divideBy: 1000, unit: 'kWh' },
            'local-data':  { divideBy: 1000, unit: 'TB' },
            'ai-claude-input-tokens':  { divideBy: 1000000, unit: 'M tokens' },
            'ai-claude-output-tokens': { divideBy: 1000, unit: 'k tokens' }
        },
        // Names and sources come from the JSON data file (in English). These literals only declare their translations
        carbonMetricLabels: function () {
            return {
                names: {
                    'energy': I18n.t('metric.energy', 'Energy'),
                    'cold-water': I18n.t('metric.cold-water', 'Cold water'),
                    'hot-water': I18n.t('metric.hot-water', 'Hot water'),
                    'gasoline': I18n.t('metric.gasoline', 'Gasoline'),
                    'kerosene': I18n.t('metric.kerosene', 'Kerosene'),
                    'train-travels': I18n.t('metric.train-travels', 'Train travels'),
                    'ai-engine-prompts': I18n.t('metric.ai-engine-prompts', 'AI engine prompts'),
                    'ai-copilot-prompts': I18n.t('metric.ai-copilot-prompts', 'AI Copilot prompts'),
                    'ai-copilot-credits': I18n.t('metric.ai-copilot-credits', 'AI Copilot credits'),
                    'ai-gemini-prompts': I18n.t('metric.ai-gemini-prompts', 'AI Gemini prompts'),
                    'ai-claude-input-tokens': I18n.t('metric.ai-claude-input-tokens', 'AI Claude input tokens'),
                    'ai-claude-output-tokens': I18n.t('metric.ai-claude-output-tokens', 'AI Claude output tokens'),
                    'produced-software': I18n.t('metric.produced-software', 'Produced software'),
                    'cloud-data': I18n.t('metric.cloud-data', 'Cloud data'),
                    'local-data': I18n.t('metric.local-data', 'Local data')
                },
                sources: {
                    'International Energy Agency': I18n.t('metric-source.iea', 'International Energy Agency'),
                    'Data Transmission': I18n.t('metric-source.data-transmission', 'Data Transmission'),
                    'Mobile Communication Union': I18n.t('metric-source.mobile-communication-union', 'Mobile Communication Union'),
                    'Well-to-wheel': I18n.t('metric-source.well-to-wheel', 'Well-to-wheel'),
                    'Atmospheric Science Ratio / Non-CO2 factored': I18n.t('metric-source.atmospheric-science-ratio', 'Atmospheric Science Ratio / Non-CO2 factored'),
                    'kgCO2eq for AI usage': I18n.t('metric-source.kgco2eq-for-ai-usage', 'kgCO2eq for AI usage')
                },
                units: {
                    'units': I18n.t('metric-unit.units', 'units'),
                    'kg eqCO2': I18n.t('about.kg-eqco2', 'kg eqCO2')
                }
            }
        },
        metricName: function (metric) {
            if (I18n.locale === I18n.defaultLocale) return metric.name
            return this.carbonMetricLabels().names[metric.id] || metric.name
        },
        metricSource: function (metric) {
            if (I18n.locale === I18n.defaultLocale) return metric.factor_info
            return this.carbonMetricLabels().sources[metric.factor_info] || metric.factor_info
        },
        metricUnit: function (unit) {
            if (I18n.locale === I18n.defaultLocale) return unit
            return this.carbonMetricLabels().units[unit] || unit
        },
        formatCarbonMetricValue: function (metric) {
            let value = metric.weekly_average
            let unit = metric.unit

            let override = this.carbonMetricUnitOverride[metric.id]
            if (override) {
                value = value / override.divideBy
                unit = override.unit
            }

            return `${this.toSignificantFigures(value)} ${this.metricUnit(unit)}`
        },
        // Keep 3 significant digits, trailing zeros included (e.g. "1.40", "35.0")
        toSignificantFigures: function (value) {
            return I18n.number(Number(value).toPrecision(3))
        },
        fetchCarbonMetrics: function () {
            // Path to the JSON file generated by the PHP cron task
            const dataUrl = '/data/carbon-metrics-latest-data.json'

            fetch(dataUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network configuration issue or file missing.")
                    }
                    return response.json()
                })
                .then(data => {
                    if (typeof data.total_weekly_carbon_kg === 'number') {
                        safelySetText("#carbon-total-value", I18n.number(data.total_weekly_carbon_kg.toFixed(2)))
                    }
                    if (data.last_updated) {
                        safelySetText("#carbon-last-update", I18n.t('about.last-update', 'Last update: {date}', { date: formatVerboseDate(data.last_updated) }))
                    }
                    if (Array.isArray(data.metrics)) {
                        this.renderCarbonMetrics(data.metrics)
                        this.renderCarbonPieChart(data.metrics, data.total_weekly_carbon_kg)
                    }
                })
                .catch(error => {
                    console.error("Failed to render dynamic carbon metrics:", error)

                    safelySetText("#carbon-total-value", "--")
                    safelySetText("#carbon-last-update", I18n.t('about.last-update', 'Last update: {date}', { date: '--' }))
                    this.renderCarbonPieChart([], 0)
                })
        },
        // Classic SVG donut-chart trick: circumference is 100, so dasharray/dashoffset are plain percentages
        renderCarbonPieChart: function (metrics, totalWeeklyCarbonKg) {
            let svg = document.querySelector("#carbon-piechart")
            if (!svg) return

            svg.innerHTML = ""
            this.resetCarbonPieDetails()

            if (!totalWeeklyCarbonKg) return

            const svgNs = "http://www.w3.org/2000/svg"
            // Floor visual share so tiny slices stay hoverable, real percent is kept for the details panel
            const minVisualPercent = 0.5
            let cumulativePercent = 0

            let totalWithMinVisual = metrics.reduce((sum, metric) => {
                let percent = metric.weekly_carbon_kg / totalWeeklyCarbonKg * 100
                if (percent > 0 && percent < minVisualPercent) {
                    return sum + minVisualPercent
                }
                return sum + percent
            }, 0)

            //console.log("Total with min visual percent:", totalWithMinVisual)

            metrics.forEach(metric => {
                let percent = metric.weekly_carbon_kg / totalWeeklyCarbonKg * 100
                if (!(percent > 0)) return

                let visualPercent = percent
                if (visualPercent < minVisualPercent) {
                    visualPercent = minVisualPercent
                }
                visualPercent *= 100 / totalWithMinVisual

                let meta = this.carbonMetricMeta[metric.id] || { category: 'data' }

                console.log(visualPercent, "% for", metric.name, "(", percent, "% real )")

                let circle = document.createElementNS(svgNs, "circle")
                circle.setAttribute("cx", "21")
                circle.setAttribute("cy", "21")
                circle.setAttribute("r", "15.91549430918954")
                circle.setAttribute("class", "carbon-pie-slice category-" + meta.category)
                circle.setAttribute("stroke-dasharray", `${visualPercent} ${100 - visualPercent}`)
                circle.setAttribute("stroke-dashoffset", 25 - cumulativePercent)

                circle.addEventListener("mouseenter", () => this.showCarbonPieDetails(metric, percent))
                circle.addEventListener("click", () => this.showCarbonPieDetails(metric, percent))
                circle.addEventListener("mouseleave", () => this.resetCarbonPieDetails())

                svg.appendChild(circle)

                cumulativePercent += visualPercent
            })
        },
        showCarbonPieDetails: function (metric, percent) {
            let details = document.querySelector("#carbon-piechart-details")
            if (!details) return

            details.innerHTML = `
                <p class="metric-name">${this.metricName(metric)}</p>
                <p class="metric-percent">${I18n.t('about.percent-of-weekly-carbon', '{percent}% of weekly carbon', { percent: I18n.number(percent.toFixed(1)) })}</p>
                <p class="metric-carbon">${this.formatCarbonMetricValue(metric)} &middot; ${this.toSignificantFigures(metric.weekly_carbon_kg)} ${I18n.t('about.kg-eqco2', 'kg eqCO2')}</p>
            `
        },
        resetCarbonPieDetails: function () {
            let details = document.querySelector("#carbon-piechart-details")
            if (!details) return

            details.innerHTML = "<p class=\"placeholder\">" + I18n.t('about.hover-a-slice-to-see-details', 'Hover a slice to see details') + "</p>"
        },
        renderCarbonMetrics: function (metrics) {
            let grid = document.querySelector("#carbon-metrics-grid")
            if (!grid) return

            grid.innerHTML = ""

            metrics.forEach(metric => {
                let meta = this.carbonMetricMeta[metric.id] || { icon: 'fa-circle', category: 'data' }

                let item = document.createElement("div")
                item.className = "carbon-metric-item category-" + meta.category
                item.setAttribute("data-metric-id", metric.id)

                item.innerHTML = `
                    <span class="fa ${meta.icon} carbon-metric-icon"></span>
                    <span class="carbon-metric-name">${this.metricName(metric)}</span>
                    <span class="carbon-metric-value">${this.formatCarbonMetricValue(metric)}</span>
                    <div class="carbon-metric-tooltip">
                        <p>${I18n.t('about.metric-factor', 'Factor: {factor} {co2} / {unit}', { factor: this.toSignificantFigures(metric.factor_to_kg_co2), co2: I18n.t('about.kg-eqco2', 'kg eqCO2'), unit: this.metricUnit(metric.unit) })}</p>
                        <p>${I18n.t('about.metric-source', 'Source: {source}', { source: this.metricSource(metric) })}</p>
                        <p>${I18n.t('about.metric-weekly-carbon', 'Weekly carbon: {value} {co2}', { value: this.toSignificantFigures(metric.weekly_carbon_kg), co2: I18n.t('about.kg-eqco2', 'kg eqCO2') })}</p>
                    </div>
                `

                grid.appendChild(item)
            })
        },
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
        },
        randomizeFrameOrientation: function () {
            if (Math.random() < 0.5) {
                document.querySelector("img#tilted-square-frame").classList += "tilt-even-more"
            }
        }
    },
    mounted: function () {

        this.activateBioQuanticGlitch()
        this.randomizeFrameOrientation()
        this.fetchCarbonMetrics()
    }
}
