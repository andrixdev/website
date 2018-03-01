// Returns [4, 0, 1, 3, 2] for maxNumber = 5, for instance
function randomIndexes(maxNumber) {
    var arr = [];

    while (arr.length < maxNumber) {
        var newRand = Math.floor(maxNumber * Math.random());
        var isAlreadyThere = false;
        for (var i = 0; i < arr.length; i++) {
            if (newRand == arr[i]) isAlreadyThere = true;
        }
        if (!isAlreadyThere) arr.push(newRand);
    }

    return arr;
}

/**
 *
 * @param {Array} paths
 * @param {Number} maxNumber
 * @returns Only *maxNumber* randomly chosen paths
 */
function randomizePaths(paths, maxNumber) {
    var output = [];
    var total = paths.length;

    // Pick random animations
    var swapped = randomIndexes(total);
    var indexes = swapped.slice(0, maxNumber);

    for (var ind = 0; ind < indexes.length; ind++) {
        output.push(paths[indexes[ind]]);
    }

    return output;
}

function isIE() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    return (msie > 0 || !!ua.match(/Trident.*rv\:11\./));
}

function isIEorEdge() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var edge = ua.indexOf('Edge/');

    return (msie > 0 || !!ua.match(/Trident.*rv\:11\./) || edge > 0);
}