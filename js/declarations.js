// All vars that need to be defined first for references
var Global = {
    router: undefined,
    router2: undefined
};

// Shared defensive helper: sets text content without throwing if the DOM element is missing
function safelySetText(selector, value) {
    var element = document.querySelector(selector)
    if (element) {
        element.textContent = value
    }
}

// Shared helper: formats a YYYY-MM-DD string into a verbose date, splitting it to avoid timezone/DST shifting issues
function formatVerboseDate(dateString) {
    if (!dateString) return ""

    var parts = dateString.split('-')
    if (parts.length !== 3) return dateString // Fallback if format is unexpected

    var year = parts[0]
    // JavaScript months are 0-indexed (January is 0, December is 11)
    var monthIndex = parseInt(parts[1], 10) - 1
    var day = parseInt(parts[2], 10)

    var shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    var monthName = shortMonths[monthIndex] || ""

    // Determine the mathematical ordinal suffix (st, nd, rd, th)
    var suffix = "th"
    if (day < 11 || day > 13) {
        switch (day % 10) {
            case 1: suffix = "st"; break
            case 2: suffix = "nd"; break
            case 3: suffix = "rd"; break
        }
    }

    return monthName + " " + day + suffix + ", " + year
}

