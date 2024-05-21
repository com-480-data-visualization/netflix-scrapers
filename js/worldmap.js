width_svg = 0;
height_svg = 0;

// Took inspiration from Patrick's code and https://d3-graph-gallery.com/graph/choropleth_hover_effect.html
function worldMap(world_info, person, dimensions) {

    width_svg = dimensions.width + margin.left + margin.right;
    height_svg = dimensions.height + margin.top + margin.bottom;

    $('#world_map').empty()
    var svg = d3.select("#world_map")
        .append("svg")
        .attr("width", width_svg)
        .attr("height", height_svg);

    // Map and projection
    const projection = d3
        .geoEquirectangular()
        .center([0, 15]) // set centre to further North as we are cropping more off bottom of map
        .scale([width_svg / (2 * Math.PI)]) // scale to fit group width
        .translate([width_svg / 2, height_svg / 2]) // ensure centred in group
    ;
    const path = d3.geoPath().projection(projection);

    // Data and color scale
    const data = new Map();
    world_info.forEach((value, key) => {
        const sum = parseInt(value.actors, 10) + parseInt(value.directors, 10);
        data.set(key, sum);
    });

    const colorScale = d3.scaleThreshold()
        .domain([0, 1, 10, 25, 50, 100, 250, 500, 1000, 2000, 4000])
        .range([
            "#ffffff",
            "#ffffcc",
            "#ffeb99",
            "#ffd966",
            "#ffc733",
            "#ffb400",
            "#ff8c00",
            "#ff5500",
            "#e60000",
            "#a000a0",
            "#4b0082",
            "#301934"
        ]);


    // tooltips
    var tooltip = d3.select('#world_map')
        .append('div')
        .style('opacity', 0)
        .attr('class', 'tooltip')
        .style('background-color', 'black')
        .style('border-radius', '15px')
        .style('padding', '12px')
        .style('color', 'white')
        .style('width', '275px');

    // Load external data and boot
    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")]).then(function (loadData) {
        let topo = loadData[0]

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

        var showTooltipCountry = function (event, d) {
            tooltip.transition().duration(duration_tooltip);
            text = '<span class="tooltip-header">Country: ' + d.properties.name + '</span><br>';
            info = world_info.get(d.id);
            if (info != undefined) {
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

        let drawCountry = function (id) {
            // Filter data to only keep the country of interest
            data.features = topo.features.filter(d => {
                return d.id == id
            })

            // Remove the map
            svg.selectAll("path").remove();
            svg.select(".legendMap").remove();
            svg.selectAll("circle").remove();

            // Set projection
            const country = world_info.get(id);
            const position = country.position;
            const lat = parseFloat(position.lat);
            const long = parseFloat(position.long);
            console.log(country, lat, long);
            var countryProjection = d3.geoEquirectangular()
                .center([long, lat])
                .scale(850)   // NEED TO ADJUST IT DYNAMICALLY: This is like the zoom
                .translate([width_svg / 2, height_svg / 2])

            // Draw the country
            svg.append("g")
                .selectAll("path")
                .data(topo.features)
                .enter()
                .append("path")
                .attr("fill", function (d) {
                    if (d.id == id) return "#FFFFFF";
                    return "#d2d2d2";
                })
                .attr("d", d3.geoPath()
                    .projection(countryProjection))
                .style("stroke", "none")
                .on("click", drawMap)
        }

        let drawMap = function () {
            // Remove the map
            svg.selectAll("path").remove();
            svg.selectAll("circle").remove();

            // Draw the map
            svg.append("g")
                .selectAll("path")
                .data(topo.features)
                .enter()
                .append("path")
                // draw each country
                .attr("d", path)
                // set the color of each country
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
                    drawCountry(d.id);
                    mouseLeave(event.target);
                    hideTooltip(event, d);
                }
            }).on("mousemove", moveTooltip)
                .on("mouseleave", function (event, d) {
                    mouseLeave(event.target);
                    hideTooltip(event, d);
                });

            if (person.place != null) {
                // Convert latitude and longitude to SVG coordinates
                const [x, y] = projection([person.position.long, person.position.lat]);
                // Add a circle for the place of birth of the actor/director
                svg.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", 5)
                    .style("fill", "#FFFF00")
                    .on("mouseover", showTooltipPoint)
                    .on("mousemove", moveTooltip)
                    .on("mouseleave", hideTooltip)
                    .classed("blinking", true);
            } else {
                // Display a message that the birthplace was not found
                var alertText = svg.append("text")
                    .attr("x", width_svg / 2)
                    .attr("y", 0.1 * height_svg)
                    .attr("text-anchor", "middle")
                    .attr("fill", "white")
                    .style("font-style", "italic")
                    .text("Birthplace not found.");
            }
            drawLegendMap(svg, colorScale, 20, height_svg * 2 / 3);

        }

        drawMap();
    })
}

function drawLegendMap(svg, colorScale, legendWidth, legendHeight) {
    const legendMargin = {top: height_svg / 3, right: 10, bottom: 0, left: 0};
    const legendSvgWidth = legendWidth + legendMargin.left + legendMargin.right;
    const legendSvgHeight = legendHeight + legendMargin.top + legendMargin.bottom;

    const legendGroup = svg.append("g")
        .attr("class", "legendMap")
        .attr("transform", `translate(${legendMargin.left},${legendMargin.top})`);

    const legendData = [
        {color: "#ffffcc", label: "0-1"},
        {color: "#ffeb99", label: "1-10"},
        {color: "#ffd966", label: "10-25"},
        {color: "#ffc733", label: "25-50"},
        {color: "#ffb400", label: "50-100"},
        {color: "#ff8c00", label: "100-250"},
        {color: "#ff5500", label: "250-500"},
        {color: "#e60000", label: "500-1000"},
        {color: "#a000a0", label: "1000-2000"},
        {color: "#4b0082", label: "2000-4000"},
        {color: "#301934", label: "4000+"}
    ];

    legendGroup.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * (legendHeight / legendData.length))
        .attr("width", legendWidth)
        .attr("height", legendHeight / legendData.length)
        .attr("fill", d => d.color);

    legendGroup.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", legendWidth + 5)
        .attr("y", (d, i) => (i + 0.5) * (legendHeight / legendData.length))
        .attr("dy", "0.35em")
        .text(d => d.label)
        .style("font-size", "12px")
        .style("text-anchor", "start");
}