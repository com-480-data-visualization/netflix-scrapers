/**
 * @fileOverview Netflix Scrapers World map, COM480 @ EPFL
 * @module js/worldmap
 * @description This file contains the functions to display a world map with the number of actors and directors per country.
 * @author Jérémy Chaverot
 * @version 1.0.0
 * @created 2024-05-10
 * @last-modified 2024-05-31
 */

/** Definition of some global variables */
width_svg = 0;
height_svg = 0;
minRadius = 3;
maxRadius = 20;

/**
 * Displays a world map with the number of actors and directors per country.
 *
 * @param {Map} world_info - A map with the information of the countries.
 * @param {Object} person - The information of the person.
 * @param {Object} dimensions - The dimensions of the SVG.
 * @note Took inspiration from Patrick's code and https://d3-graph-gallery.com/graph/choropleth_hover_effect.html
 */
function worldMap(world_info, person, dimensions) {

    /** Retrieve the dimensions of the svg */
    width_svg = dimensions.width + margin.left + margin.right;
    height_svg = dimensions.height + margin.top + margin.bottom;

    /** Create the svg element for the world map */
    $('#world_map').empty()
    var svg = d3.select("#world_map")
        .append("svg")
        .attr("width", width_svg)
        .attr("height", height_svg);

    /** The zoom utils for the map navigation */
    function zoomed(event) {
        svg.selectAll('path').attr("transform", event.transform);
        svg.selectAll('circle').attr("transform", event.transform);
    }
    function resetZoom() {
        svg.transition()
            .duration(500)
            .call(zoom.transform, d3.zoomIdentity);
    }
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);
    svg.call(zoom);
    let zoomFactor = dimensions.width < 600 ? 4 : 1;

    /** Definition of the map and the projection */
    const projection = d3
        .geoEquirectangular()
        .center([0, 15]) // set centre to further North as we are cropping more off bottom of map
        .scale([width_svg / (2 * Math.PI) * zoomFactor])
        .translate([width_svg / 2, height_svg / 2])
    ;
    const path = d3.geoPath().projection(projection);

    /** Definition of the data */
    const data = new Map();
    world_info.forEach((value, key) => {
        const sum = parseInt(value.actors, 10) + parseInt(value.directors, 10);
        data.set(key, sum);
    });

    /** Definition of the color scale */
    const colorScale = d3.scaleThreshold()
        .domain([0, 1, 10, 25, 50, 100, 250, 500, 1000, 2000, 4000])
        .range([
            d3.interpolateYlOrRd(0),
            d3.interpolateYlOrRd(0.1),
            d3.interpolateYlOrRd(0.2),
            d3.interpolateYlOrRd(0.3),
            d3.interpolateYlOrRd(0.4),
            d3.interpolateYlOrRd(0.5),
            d3.interpolateYlOrRd(0.6),
            d3.interpolateYlOrRd(0.7),
            d3.interpolateYlOrRd(0.8),
            d3.interpolateYlOrRd(0.9),
            d3.interpolateYlOrRd(1)
        ]);


    /** Definition of the tooltip */
    var tooltip = d3.select('#world_map')
        .append('div')
        .style('opacity', 0)
        .attr('class', 'tooltip')
        .style('background-color', 'black')
        .style('border-radius', '15px')
        .style('padding', '12px')
        .style('color', 'white')
        .style('width', '275px');

    /** Load external data with the geojson that traces the world segments and boot */
    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")]).then(function (loadData) {
        let topo = loadData[0]


        /** Defines on mouse over a country action */
        let mouseOver = function (d) {
            d3.selectAll(".Country")
                .transition()
                .duration(50)
                .style("opacity", .85)
            d3.select(d)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black")
        }

        /** Defines on mouse leave a country action */
        let mouseLeave = function (d) {
            d3.selectAll(".Country")
                .transition()
                .duration(50)
                .style("opacity", 1)
            d3.select(d)
                .transition()
                .duration(200)
                .style("stroke", null)
        }

        /** Define the tooltip when over a country */
        var showTooltipCountry = function (event, d) {
            tooltip.transition().duration(duration_tooltip);
            text = '<span class="tooltip-header">Country: ' + d.properties.name + '</span><br>';
            info = world_info.get(d.id);
            if (info !== undefined) {
                text += 'Actors: ' + info.actors + '<br>';
                text += 'Directors: ' + info.directors + '<br>';
                text += 'Mean IMDB: ' + info.imdb + '<br>';
                text += 'Mean TMDB: ' + info.tmdb + '<br>';
            }
            tooltip.style("opacity", 1)
                .html(text)
                .style("left", event.x + offset_tooltip + "px")
                .style("top", event.y + offset_tooltip + "px");
        }

        /** Define the tooltip when over a birthplace */
        var showTooltipPoint = function (event, d) {
            tooltip.transition().duration(duration_tooltip);
            text = 'Name: ' + person.name + '<br>';
            text += 'Birthplace: ' + person.place + '<br>';
            tooltip.style("opacity", 1)
                .html(text)
                .style("left", event.x + offset_tooltip + "px")
                .style("top", event.y + offset_tooltip + "px");
        }
        var moveTooltip = function (event, d) {
            tooltip.style("left", event.x + offset_tooltip + "px")
                .style("top", event.y + offset_tooltip + "px");

        }
        var hideTooltip = function (event, d) {
            tooltip.transition()
                .duration(duration_tooltip)
                .style("opacity", 0);
        }

        /** Function that draws the birthplace of the specified person */
        let drawPerson = function (proj, color, size) {
            // Convert latitude and longitude to SVG coordinates
            const [x, y] = proj([person.position.long, person.position.lat]);
            // Add a circle for the place of birth of the actor/director
            svg.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", size)
                .style("fill", color)
                .on("mouseover", showTooltipPoint)
                .on("mousemove", moveTooltip)
                .on("mouseleave", hideTooltip)
                .classed("blinking", true);
        }

        /**
         * Functions that draws the given country.
         *
         * @param {string} id - The id of the country.
         */
        function drawCountry(id) {
            /** Filter data to only keep the country of interest */
            data.features = topo.features.filter(d => {
                return d.id === id;
            });

            /** Add a circle for the place of birth of the actor/director */
            let bubbles = retrieveBirthplacesCountry(id);
            let maxSize = 0;
            for (let i = 0; i < bubbles.length; i++) {
                if (bubbles[i].count > maxSize) {
                    maxSize = bubbles[i].count;
                }
            }

            /** Remove the map */
            svg.selectAll("path").remove();
            svg.select(".legendMap").remove();
            svg.selectAll("circle").remove();
            svg.select(".legendBubbles").remove();
            d3.select("#slider").remove();

            /** Set projection */
            const country = world_info.get(id);
            const position = country.position;
            const lat = parseFloat(position.lat);
            const long = parseFloat(position.long);
            var countryProjection = d3.geoEquirectangular()
                .center([long, lat])
                .scale(country.scale)
                .translate([width_svg / 2, height_svg / 2]);

            /** Zoom on the country */
            svg.append("g")
                .selectAll("path")
                .data(topo.features)
                .enter()
                .append("path")
                .attr("fill", function (d) {
                    if (d.id === id) return "#FFFFFF";
                    return "#d2d2d2";
                })
                .attr("d", d3.geoPath().projection(countryProjection))
                .style("stroke", "none")
                .on("click", function (event, d) {
                    svg.select(".legendBubbles").remove();
                    d3.select("#slider").remove();
                    resetZoom();
                    drawMap();
                });

            /** Define the on mouse over bubbles action */
            var mouseoverbubble = function (event, d) {
                tooltip.style("opacity", 1);
            };
            var mousemovebubble = function (event, d) {
                tooltip
                    .html(d.place + "<br>" + "Actors/Directors: " + d.count)
                    .style("left", event.x - 10 + "px")
                    .style("top", event.y - 10 + "px");
            };
            var mouseleavebubble = function (event, d) {
                tooltip.style("opacity", 0);
            };

            /** Define the radius scale for the bubble */
            var radiusScale = d3.scaleLog()
                .domain([1, maxSize])
                .range([minRadius, maxRadius]);

            /** Define the color scale for the bubble */
            var bubbleColorScale = d3.scaleLog()
                .domain([1, maxSize])
                .range(["white", "red"]);

            /** Define the slider */
            const sliderWidth = width_svg < 600 ? width_svg : width_svg / 2;
            var slider = d3.sliderHorizontal()
                .min(1)
                .max(maxSize + 1)
                .step(1)
                .width(sliderWidth - 40)
                .displayValue(true)
                .on('onchange', (val) => {
                    resetZoom();
                    drawBubbles(val);
                });

            d3.select("#world_map")
                .append('div')
                .attr("id", "slider")
                .append('svg')
                .attr('width', sliderWidth)
                .attr('height', 80)
                .append('g')
                .attr('transform', 'translate(20,40)')
                .call(slider);

            /**
             * Function that draws the bubbles
             */
            function drawBubbles(minCount) {
                svg.selectAll("circle").remove();
                svg.selectAll("myCircles")
                    .data(bubbles.filter(d => d.count >= minCount))
                    .enter()
                    .append("circle")
                    .attr("cx", function (d) {
                        return countryProjection([d.position.long, d.position.lat])[0];
                    })
                    .attr("cy", function (d) {
                        return countryProjection([d.position.long, d.position.lat])[1];
                    })
                    .attr("r", function (d) {
                        return radiusScale(d.count);
                    })
                    .attr("class", "circle")
                    .style("fill", function (d) {
                        return bubbleColorScale(d.count);
                    })
                    .attr("stroke", "#000000")
                    .attr("stroke-width", 3)
                    .attr("fill-opacity", .4)
                    .on("mouseover", mouseoverbubble)
                    .on("mousemove", mousemovebubble)
                    .on("mouseleave", mouseleavebubble);

                if (person.iso === id) {
                    drawPerson(countryProjection, "000000", 8);
                }
            }

            drawBubbles(1);
            drawLegendBubbles(svg, bubbleColorScale, maxSize, country);
        }

        /**
         * Function that draws the map.
         */
        let drawMap = function () {
            /** Remove the map */
            svg.selectAll("path").remove();
            svg.selectAll("circle").remove();

            /** Draw the map */
            svg.append("g")
                .selectAll("path")
                .data(topo.features)
                .enter()
                .append("path")
                /** draw each country */
                .attr("d", path)
                /** set the color of each country */
                .attr("fill", function (d) {
                    d.total = data.get(d.id) || 0;
                    return colorScale(d.total);
                })
                .style("stroke", "transparent")
                .attr("class", function (d) {
                    return "Country"
                })
                .style("opacity", .8)
                .on("mouseover", function (event, d) {
                    mouseOver(event.target);
                    showTooltipCountry(event, d);
                }).on("click", function (event, d) {
                if (world_info.has(d.id)) {
                    resetZoom();
                    drawCountry(d.id);
                    mouseLeave(event.target);
                    hideTooltip(event, d);
                }
            }).on("mousemove", moveTooltip)
                .on("mouseleave", function (event, d) {
                    mouseLeave(event.target);
                    hideTooltip(event, d);
                });

            /** Logic to draw the person's birthplace if found, else states that wasn't */
            if (person.place != null) {
                drawPerson(projection, "#FFFF00", 5);
            } else {
                /** Display a message that the birthplace was not found */
                var alertText = svg.append("text")
                    .attr("x", width_svg / 2)
                    .attr("y", 0.1 * height_svg)
                    .attr("text-anchor", "middle")
                    .attr("fill", "white")
                    .style("font-style", "italic")
                    .text("Birthplace not found.");
            }

            drawLegendMap(svg, colorScale, width_svg / 100, (height_svg + width_svg) * 0.2);
        }

        drawMap();
    })
}

/**
 * Draws the legend for the map.
 *
 * @param svg The SVG element.
 * @param colorScale The color scale.
 * @param legendWidth The width of the legend.
 * @param legendHeight The height of the legend.
 */
function drawLegendMap(svg, colorScale, legendWidth, legendHeight) {
    const legendMargin = {top: (height_svg - legendHeight) / 2, right: 10, bottom: 20, left: 0};
    const textSize = 12 + parseInt(width_svg / 600);
    const spacerHeight = 10;

    const legendGroup = svg.append("g")
        .attr("class", "legendMap")
        .attr("transform", `translate(${legendMargin.left},${legendMargin.top})`);

    const titleText = legendGroup.append("text")
        .attr("x", 0)
        .attr("y", -textSize * 2)
        .style("font-size", textSize + "px")
        .style("font-weight", "bold")
        .style("text-anchor", "start");

    titleText.append("tspan")
        .attr("x", 0)
        .attr("dy", "1em")
        .text("Number of");

    titleText.append("tspan")
        .attr("x", 0)
        .attr("dy", "1em")
        .text("actors/directors");

    const legendData = [
        {color: d3.interpolateYlOrRd(0), label: "0-1"},
        {color: d3.interpolateYlOrRd(0.1), label: "1-10"},
        {color: d3.interpolateYlOrRd(0.2), label: "10-25"},
        {color: d3.interpolateYlOrRd(0.3), label: "25-50"},
        {color: d3.interpolateYlOrRd(0.4), label: "50-100"},
        {color: d3.interpolateYlOrRd(0.5), label: "100-250"},
        {color: d3.interpolateYlOrRd(0.6), label: "250-500"},
        {color: d3.interpolateYlOrRd(0.7), label: "500-1000"},
        {color: d3.interpolateYlOrRd(0.8), label: "1000-2000"},
        {color: d3.interpolateYlOrRd(0.9), label: "2000-4000"},
        {color: d3.interpolateYlOrRd(1), label: "4000+"}
    ];

    legendGroup.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => spacerHeight + (i * (legendHeight / legendData.length)))
        .attr("width", legendWidth)
        .attr("height", legendHeight / legendData.length)
        .attr("fill", d => d.color);

    legendGroup.selectAll("text.label")
        .data(legendData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", legendWidth + 5)
        .attr("y", (d, i) => spacerHeight + ((i + 0.5) * (legendHeight / legendData.length)))
        .attr("dy", "0.35em")
        .text(d => d.label)
        .style("font-size", textSize + "px")
        .style("text-anchor", "start");
}

/**
 * Draws the legend for the bubbles.
 *
 * @param svg The SVG element.
 * @param colorScale The color scale.
 * @param maxSize The maximum size of the bubble.
 * @param countryInfo The information of the country.
 */
function drawLegendBubbles(svg, colorScale, maxSize, countryInfo) {
    const legendWidth = 100 + parseInt(width_svg / 15);
    const legendMargin = {top: height_svg - 30, right: 20, bottom: 20, left: 20};
    let textSize = 9 + parseInt(width_svg / 600);

    const legendGroup = svg.append("g")
        .attr("class", "legendBubbles")
        .attr("transform", `translate(${legendMargin.left},${legendMargin.top})`);

    let legendData;
    if (maxSize === 1) {
        legendData = [1];
    } else if (maxSize < 10) {
        legendData = [1, maxSize];
    } else if (maxSize < 100) {
        legendData = [1, 10, maxSize];
    } else {
        legendData = [1, 10, 100, maxSize];
    }

    const numberOfItems = legendData.length === 1 ? legendData.length + 1 : legendData.length;
    const spacing = legendWidth / (numberOfItems - 1);

    const countryInfoText = `${countryInfo.name},   Mean IMDB: ${countryInfo.imdb},   TMDB: ${countryInfo.tmdb}`;

    legendGroup.append("text")
        .attr("x", 0)
        .attr("y", -40)
        .style("font-size", (textSize + 2).toString() + "px")
        .style("text-anchor", "start")
        .text(countryInfoText);

    legendGroup.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .style("font-size", (textSize + 1).toString() + "px")
        .style("text-anchor", "start")
        .text("Number of Actors/Directors");

    legendGroup.selectAll("rect.colorLegend")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("class", "colorLegend")
        .attr("x", (d, i) => i * spacing)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => colorScale(d));

    legendGroup.selectAll("text.value")
        .data(legendData)
        .enter()
        .append("text")
        .attr("class", "value")
        .attr("x", (d, i) => i * spacing + 15)
        .attr("y", 5)
        .attr("dy", "0.35em")
        .text(d => d)
        .style("font-size", textSize.toString() + "px")
        .style("text-anchor", "start");
}


