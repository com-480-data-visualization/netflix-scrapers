
function getColor(percentage) {
	red = (percentage < 50.0) ? 255 : Math.round(510 - 5.1 * percentage)
    green = (percentage < 50.0) ? Math.round(5.1 * percentage) : 255 
    blue = 0
	hue = (0x10000 * red + 0x100 * green + blue).toString(16)
	color = '#' + ('000000' + hue).slice(-6)
    return color
}

function getMin(data, key) {
    return data.reduce(function(res, obj) {
        return (obj[key] < res[key]) ? obj : res
    })[key];
}

function getMax(data, key) {
    return data.reduce(function(res, obj) {
        return (obj[key] > res[key]) ? obj : res
    })[key];
}